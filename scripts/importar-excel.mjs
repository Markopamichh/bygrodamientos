import xlsx from 'xlsx';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Cargar .env.local
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');
readFileSync(envPath, 'utf-8').split('\n').forEach((line) => {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
  if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
});

const EXCEL_PATH = '/Users/markopamich/Desktop/Stock byg.xlsx';
const DRY_RUN = process.argv.includes('--dry-run');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const CATS = {};

function mapCategoria(rubro) {
  const r = (rubro || '').toString().toUpperCase();
  if (!r.trim()) return null;
  if (r.includes('SELLO')) return CATS['sellos'];
  if (r.includes('RETEN')) return CATS['retenes'];
  if (r.includes('SOPORTE')) return CATS['soportes-para-rodamientos'];
  if (r.includes('LINEAL')) return CATS['sistemas-lineales'];
  if (r.includes('CORREA') || r.includes('TENSOR') || r.includes('DISTRIBUC') || r.includes('MANGUITO'))
    return CATS['transmision'];
  if (
    r.includes('CRAPODINA') || r.includes('EMBRAGUE') || r.includes('BOMBA') ||
    r.includes('CRUCETA') || r.includes('RUEDA') || r.includes('MAZA') ||
    r.includes('SUSPENSION') || r.includes('SUSPENSIÓN') || r.includes('HORQUILLA') ||
    r.includes('CARDAN') || r.includes('PORTACRUCETA') || r.includes('BANCADA') ||
    r.includes('PUNTA')
  )
    return CATS['automotriz'];
  if (r.includes('TUERCA') || r.includes('ARANDELA')) return CATS['tuercas-y-arandelas'];
  if (
    r.includes('RULEMAN') || r.includes('RODAMIENTO') || r.includes('AGUJAS') ||
    r.includes('ROTULA') || r.includes('RÓTULA') || r.includes('CASQUILLO') ||
    r.includes('CORONA') || r.includes('RODILLO') || r.includes('INSERTABLE')
  )
    return CATS['rodamientos'];
  return null;
}

function slugify(text) {
  return (
    text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'producto'
  );
}

// Extrae código (antes del primer "(") y medidas (dentro del último "(...)")
function parseNombre(nombre) {
  const n = nombre.toString().trim();
  // código = texto antes del primer "("
  let codigo = n.split('(')[0].trim();
  // si arranca con "(", el código está dentro del primer paréntesis
  if (!codigo) {
    const primer = n.match(/\(([^)]*)\)/);
    codigo = primer ? primer[1].trim() : n;
  }
  codigo = codigo.slice(0, 50) || n.slice(0, 50);

  // medidas = contenido del último grupo de paréntesis con formato NxNxN
  const grupos = [...n.matchAll(/\(([^)]*)\)/g)].map((m) => m[1]);
  let medida_interna = null, medida_externa = null, ancho = null;
  for (let i = grupos.length - 1; i >= 0; i--) {
    const partes = grupos[i].split(/[xX]/).map((p) => p.trim());
    const nums = partes.filter((p) => p && p !== '-' && !isNaN(Number(p)));
    if (nums.length >= 2) {
      medida_interna = partes[0] && partes[0] !== '-' ? partes[0].slice(0, 20) : null;
      medida_externa = partes[1] && partes[1] !== '-' ? partes[1].slice(0, 20) : null;
      ancho = partes[2] && partes[2] !== '-' ? partes[2].slice(0, 20) : null;
      break;
    }
  }
  return { codigo, medida_interna, medida_externa, ancho };
}

async function main() {
  const { data: cats } = await supabase.from('categorias').select('id, nombre, slug');
  cats.forEach((c) => (CATS[c.slug] = c));

  const wb = xlsx.readFile(EXCEL_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, { defval: '' });
  const isRef = (v) => (v || '').toString().includes('#REF');

  const slugsUsados = new Set();
  const codigosUsados = new Set();
  const registros = []; // { producto, item }
  let descartados = 0;

  for (const row of rows) {
    const nombre = (row.Nombre || '').toString().trim();
    if (!nombre || isRef(nombre)) {
      descartados++;
      continue;
    }
    const cat = mapCategoria(row.Rubro);
    const marca = (row.Marca || '').toString().trim() || null;
    // Rubro crudo del Excel (tal cual), para mostrar/buscar en el stock interno
    const rubro = (row.Rubro || '').toString().trim() || null;

    let base = slugify(nombre);
    let slug = base;
    let k = 2;
    while (slugsUsados.has(slug)) slug = `${base}-${k++}`;
    slugsUsados.add(slug);

    const aplicaciones = [row['Aplicación'], row['Aplicación_1']]
      .map((a) => (a || '').toString().trim())
      .filter(Boolean);

    const precioRaw = row[' Precio '];
    const precio = precioRaw === '' || precioRaw == null ? null : Number(precioRaw);
    const stockRaw = row.STOCK;
    const stock = stockRaw === '' || stockRaw == null ? 0 : Math.trunc(Number(stockRaw)) || 0;

    let { codigo, medida_interna, medida_externa, ancho } = parseNombre(nombre);

    // codigo debe ser único (constraint items_codigo_unico).
    // Duplicados = mismo código, distinta marca → sufijo de marca; si aún colisiona, número.
    if (codigosUsados.has(codigo)) {
      const marcaSufijo = (marca || '').toString().toUpperCase().replace(/[^A-Z0-9]/g, '');
      let cand = marcaSufijo ? `${codigo}-${marcaSufijo}` : codigo;
      let j = 2;
      while (codigosUsados.has(cand)) cand = `${codigo}-${marcaSufijo || 'X'}-${j++}`;
      codigo = cand.slice(0, 50);
    }
    codigosUsados.add(codigo);

    registros.push({
      producto: {
        nombre,
        slug,
        descripcion: (row.OBSERVACIONES || '').toString().trim() || null,
        categoria_id: cat ? cat.id : null,
        categoria_nombre: cat ? cat.nombre : null,
        categoria_slug: cat ? cat.slug : null,
        subcategoria: rubro, // rubro crudo del Excel (visible en stock interno)
        fabricante: marca,
        stock,
        precio,
        aplicaciones,
        tipo_disponibilidad: 'stock',
        activo: false, // NUNCA en la web — solo sistema interno
      },
      item: {
        codigo,
        fabricante: marca,
        medida_interna,
        medida_externa,
        ancho,
        stock_actual: stock,
        stock_minimo: 0,
        precio_venta: precio,
        activo: true,
      },
    });
  }

  console.log('=== RESUMEN ===');
  console.log('Registros a importar:', registros.length);
  console.log('Descartados (#REF!/sin nombre):', descartados);

  // Duplicados de código
  const codes = registros.map((r) => r.item.codigo);
  const dupCount = codes.length - new Set(codes).size;
  console.log('Códigos duplicados:', dupCount);

  console.log('\n=== EJEMPLOS DE EXTRACCIÓN ===');
  [0, 1600, 2700, 4000].forEach((i) => {
    const r = registros[i];
    if (r) console.log(JSON.stringify({ nombre: r.producto.nombre, codigo: r.item.codigo, med: [r.item.medida_interna, r.item.medida_externa, r.item.ancho], cat: r.producto.categoria_slug, stock: r.item.stock_actual, precio: r.item.precio_venta }));
  });

  if (DRY_RUN) {
    console.log('\n[DRY RUN] No se insertó nada.');
    return;
  }

  // Insertar productos en batches, recuperar ids por slug
  console.log('\n=== INSERTANDO PRODUCTOS ===');
  const BATCH = 200;
  const slugToId = new Map();
  for (let i = 0; i < registros.length; i += BATCH) {
    const batch = registros.slice(i, i + BATCH).map((r) => r.producto);
    const { data, error } = await supabase.from('productos').insert(batch).select('id, slug');
    if (error) { console.error('Error productos:', error.message); process.exit(1); }
    data.forEach((d) => slugToId.set(d.slug, d.id));
    console.log(`  productos ${Math.min(i + BATCH, registros.length)}/${registros.length}`);
  }

  // Insertar items ligados
  console.log('\n=== INSERTANDO ITEMS ===');
  let itemsOk = 0;
  for (let i = 0; i < registros.length; i += BATCH) {
    const batch = registros.slice(i, i + BATCH).map((r) => ({
      ...r.item,
      producto_id: slugToId.get(r.producto.slug),
    }));
    const { error } = await supabase.from('items').insert(batch);
    if (error) { console.error('Error items:', error.message); process.exit(1); }
    itemsOk += batch.length;
    console.log(`  items ${itemsOk}/${registros.length}`);
  }

  console.log('\n✅ Importación completa:', registros.length, 'productos +', itemsOk, 'items');
}

main().catch((e) => { console.error(e); process.exit(1); });
