// Script: descarga imágenes del CDN de MR, las optimiza con sharp y las sube a Supabase Storage.
// Actualiza imagen_url en la tabla productos con la nueva URL pública.
//
// Uso: node scripts/migrate-images.mjs

import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'module';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Cargar .env.local
const envPath = join(__dirname, '../.env.local');
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const val = trimmed.slice(eq + 1).trim();
  process.env[key] ??= val;
}

const sharp = require('sharp');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = 'product-images';
const CONCURRENCY = 5;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Faltan variables NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── Fetch productos con imagen en CDN de MR ───────────────────────────────────
const { data: productos, error: fetchError } = await supabase
  .from('productos')
  .select('id, slug, categoria_slug, imagen_url')
  .like('imagen_url', '%ss-cnt-001c%')
  .eq('activo', true);

if (fetchError) {
  console.error('Error al obtener productos:', fetchError.message);
  process.exit(1);
}

console.log(`\n${productos.length} productos con imágenes en CDN de MR\n`);

let ok = 0;
let fail = 0;

// ── Procesar en lotes de CONCURRENCY ─────────────────────────────────────────
async function processProduct(producto) {
  const { id, slug, categoria_slug, imagen_url } = producto;
  const label = `[${slug}]`;

  // Descargar imagen
  let response;
  try {
    response = await fetch(imagen_url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
  } catch (err) {
    console.log(`  ✗ ${label} descarga fallida: ${err.message}`);
    fail++;
    return;
  }

  // Optimizar con sharp
  let buffer;
  try {
    const original = Buffer.from(await response.arrayBuffer());
    buffer = await sharp(original)
      .webp({ quality: 80 })
      .resize(720, 720, { fit: 'inside', withoutEnlargement: true })
      .toBuffer();
  } catch (err) {
    console.log(`  ✗ ${label} procesamiento fallido: ${err.message}`);
    fail++;
    return;
  }

  // Subir a Supabase Storage
  const storagePath = `products/${categoria_slug ?? 'sin-categoria'}/${slug}.webp`;
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: 'image/webp',
      upsert: true,
      cacheControl: '31536000',
    });

  if (uploadError) {
    console.log(`  ✗ ${label} upload fallido: ${uploadError.message}`);
    fail++;
    return;
  }

  // Obtener URL pública
  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  // Actualizar DB
  const { error: updateError } = await supabase
    .from('productos')
    .update({ imagen_url: publicUrl })
    .eq('id', id);

  if (updateError) {
    console.log(`  ✗ ${label} update DB fallido: ${updateError.message}`);
    fail++;
    return;
  }

  console.log(`  ✓ ${label} → ${publicUrl}`);
  ok++;
}

// Procesar con concurrencia limitada
for (let i = 0; i < productos.length; i += CONCURRENCY) {
  const batch = productos.slice(i, i + CONCURRENCY);
  await Promise.all(batch.map(processProduct));
}

console.log(`
────────────────────────────────────────
✓ ${ok} imagen${ok !== 1 ? 'es' : ''} migrada${ok !== 1 ? 's' : ''} correctamente
${fail > 0 ? `✗ ${fail} fallida${fail !== 1 ? 's' : ''} (imagen_url sin cambios en esos productos)` : ''}
────────────────────────────────────────
`);
