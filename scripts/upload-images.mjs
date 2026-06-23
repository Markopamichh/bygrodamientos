// Script: sube todas las imágenes de imagenes_descargadas a Supabase Storage
// y genera productos-import.csv listo para importar en el panel admin.
//
// Uso: node scripts/upload-images.mjs

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, extname, basename, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// ── Credenciales ──────────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://zituwbdogothhmsudgcr.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppdHV3YmRvZ290aGhtc3VkZ2NyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjE0OTQzNSwiZXhwIjoyMDk3NzI1NDM1fQ.Z_Co3r6K5B4ZYEKzbO5yBTxU6F_pDlq7V4RQ8-WzJ6o';
const BUCKET = 'product-images';
const IMAGES_DIR = join(ROOT, 'imagenes_descargadas');

// ── Mapeo de carpetas → slug de categoría en Supabase ────────────────────────
const CATEGORY_MAP = {
  'rodamientos':                  'rodamientos',
  'Retenes':                      'retenes',
  'Componentes de trasmision':    'transmision',
  'Herramientas':                 'herramientas',
  'Linea Autommotriz':            'automotriz',
};

// ── Subcarpeta → nombre legible ───────────────────────────────────────────────
const SUBCAT_NAME_MAP = {
  'agujas':               'Agujas',
  'axiales':              'Axiales',
  'bolas_a_rotula':       'Bolas a Rótula',
  'contacto_angular':     'Contacto Angular',
  'rigidos_de_bolas':     'Rígidos de Bolas',
  'rodillos_a_rotula':    'Rodillos a Rótula',
  'rodillos_cilindricos': 'Rodillos Cilíndricos',
  'Acoples':              'Acoples',
  'Correas':              'Correas',
  'Manguitos de fijacion':'Manguitos de Fijación',
  'poleas':               'Poleas',
  'Calentadores':         'Calentadores',
  'Extractores':          'Extractores',
  'Kits':                 'Kits',
  'lubricacion':          'Lubricación',
  'Reten de Nitrilo':     'Nitrilo',
  'Reten de Poliacrillico':'Poliacrílico',
  'Reten de silicona':    'Silicona',
  'reten de viton':       'Vitón',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function slugify(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

function isRandomName(name) {
  // Nombres con espacios o guiones con palabras reales → nombre real
  // Códigos sin espacios tipo "Jkc6cbArru" → aleatorio
  return !/\s/.test(name) && /[a-z][A-Z]/.test(name) || /^\d/.test(name) || name.length > 20 && !/\s/.test(name);
}

function productNameFromFile(filename, subfolder) {
  const nameWithoutExt = basename(filename, extname(filename));
  if (isRandomName(nameWithoutExt)) {
    return SUBCAT_NAME_MAP[subfolder] ?? subfolder;
  }
  return nameWithoutExt;
}

function getAllFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...getAllFiles(full));
    } else if (/\.(webp|jpg|jpeg|png|avif)$/i.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

function getMimeType(ext) {
  return { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
           '.png': 'image/png', '.avif': 'image/avif' }[ext.toLowerCase()] ?? 'image/webp';
}

// ── Main ──────────────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const allFiles = getAllFiles(IMAGES_DIR);
console.log(`\nEncontrados ${allFiles.length} archivos en imagenes_descargadas\n`);

const rows = [];
let ok = 0;
let fail = 0;

for (const filePath of allFiles) {
  const rel = relative(IMAGES_DIR, filePath);            // ej: rodamientos/agujas/agujas_0002.jpg
  const parts = rel.replace(/\\/g, '/').split('/');       // ['rodamientos', 'agujas', 'agujas_0002.jpg']
  const topFolder = parts[0];
  const subFolder = parts.length >= 3 ? parts[1] : null;
  const fileName  = parts[parts.length - 1];

  const categoriaNombre = CATEGORY_MAP[topFolder];
  if (!categoriaNombre) {
    console.warn(`  ⚠ Carpeta desconocida: ${topFolder} — omitido`);
    fail++;
    continue;
  }

  const subcategoria = subFolder ? (SUBCAT_NAME_MAP[subFolder] ?? subFolder) : '';
  const nombre = productNameFromFile(fileName, subFolder ?? topFolder);
  const ext = extname(fileName);
  const safeFileName = slugify(basename(fileName, ext)) + ext.toLowerCase();
  const storagePath = `products/${slugify(categoriaNombre)}/${slugify(subcategoria || nombre)}/${Date.now()}-${safeFileName}`;
  const mimeType = getMimeType(ext);

  process.stdout.write(`  Subiendo: ${nombre} (${rel}) ... `);

  const fileBuffer = readFileSync(filePath);
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: true });

  if (error) {
    console.log(`❌ ${error.message}`);
    fail++;
    continue;
  }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  console.log('✓');
  ok++;

  rows.push({
    nombre,
    categoria_nombre: categoriaNombre,
    subcategoria,
    stock: 0,
    precio: '',
    fabricante: '',
    imagen_url: publicUrl,
    descripcion: '',
    descripcion_larga: '',
    activo: 'Sí',
  });
}

// ── Generar CSV ───────────────────────────────────────────────────────────────
const headers = ['nombre','categoria_nombre','subcategoria','stock','precio','fabricante','imagen_url','descripcion','descripcion_larga','activo'];
const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const csvLines = [
  headers.join(','),
  ...rows.map(r => headers.map(h => esc(r[h])).join(',')),
];
const csvPath = join(ROOT, 'productos-import.csv');
writeFileSync(csvPath, csvLines.join('\n'), 'utf-8');

console.log(`
────────────────────────────────────────
✓ ${ok} imagen${ok !== 1 ? 's' : ''} subida${ok !== 1 ? 's' : ''} correctamente
${fail > 0 ? `✗ ${fail} omitida${fail !== 1 ? 's' : ''}` : ''}
CSV generado en: productos-import.csv
────────────────────────────────────────

Próximos pasos:
1. Abrí productos-import.csv en Excel
2. Completá las columnas vacías (precio, fabricante, descripcion)
3. Importalo desde el panel admin → Productos → Importar CSV
`);
