// Script: analiza el ratio de contenido vs espacio vacío en cada imagen del Storage.
// Usa sharp para detectar cuánto ocupa el producto real dentro del cuadrado.
//
// Uso: node scripts/analizar-imagenes.mjs

import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'module';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const sharp = require('sharp');

// Cargar .env.local
const envContent = readFileSync(join(__dirname, '../.env.local'), 'utf-8');
for (const line of envContent.split('\n')) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq === -1) continue;
  process.env[trimmed.slice(0, eq).trim()] ??= trimmed.slice(eq + 1).trim();
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const { data: productos } = await supabase
  .from('productos')
  .select('id, slug, categoria_slug, imagen_url')
  .not('imagen_url', 'is', null)
  .neq('imagen_url', '')
  .eq('activo', true);

console.log(`\nAnalizando ${productos.length} imágenes...\n`);

const resultados = [];
const CONCURRENCY = 8;

async function analizarProducto(p) {
  try {
    const res = await fetch(p.imagen_url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;

    const buffer = Buffer.from(await res.arrayBuffer());
    const img = sharp(buffer);
    const meta = await img.metadata();

    // Trimear espacio blanco/gris claro (fondo típico de imágenes de productos)
    let trimInfo;
    try {
      const { info } = await sharp(buffer)
        .trim({ background: '#ffffff', threshold: 15 })
        .toBuffer({ resolveWithObject: true });
      trimInfo = info;
    } catch {
      // Si trim falla (imagen sin espacio trimeable), asumimos que llena el frame
      trimInfo = { width: meta.width, height: meta.height };
    }

    const fillRatio = Math.min(
      (trimInfo.width / meta.width) * (trimInfo.height / meta.height),
      1
    );

    return {
      slug: p.slug,
      categoria: p.categoria_slug,
      originalW: meta.width,
      originalH: meta.height,
      trimW: trimInfo.width,
      trimH: trimInfo.height,
      fillRatio: Math.round(fillRatio * 100),
    };
  } catch {
    return null;
  }
}

for (let i = 0; i < productos.length; i += CONCURRENCY) {
  const batch = productos.slice(i, i + CONCURRENCY);
  const results = await Promise.all(batch.map(analizarProducto));
  for (const r of results) {
    if (r) resultados.push(r);
  }
  process.stdout.write(`\r  ${Math.min(i + CONCURRENCY, productos.length)}/${productos.length}`);
}

// Ordenar por fill ratio (los más vacíos primero)
resultados.sort((a, b) => a.fillRatio - b.fillRatio);

console.log('\n\n── Imágenes con POCO contenido (fill < 30%) ─────────────────────────────');
const pocoContenido = resultados.filter(r => r.fillRatio < 30);
for (const r of pocoContenido) {
  console.log(`  ${String(r.fillRatio).padStart(3)}%  [${r.categoria}]  ${r.slug}`);
}

console.log('\n── Imágenes con CONTENIDO MEDIO (fill 30-60%) ───────────────────────────');
const medioContenido = resultados.filter(r => r.fillRatio >= 30 && r.fillRatio < 60);
for (const r of medioContenido) {
  console.log(`  ${String(r.fillRatio).padStart(3)}%  [${r.categoria}]  ${r.slug}`);
}

console.log('\n── Imágenes BIEN llenas (fill ≥ 60%) ────────────────────────────────────');
const bienLlenas = resultados.filter(r => r.fillRatio >= 60);
for (const r of bienLlenas) {
  console.log(`  ${String(r.fillRatio).padStart(3)}%  [${r.categoria}]  ${r.slug}`);
}

// Agrupar por categoría para ver patrones
console.log('\n── Promedio de fill por categoría ───────────────────────────────────────');
const porCategoria = {};
for (const r of resultados) {
  if (!porCategoria[r.categoria]) porCategoria[r.categoria] = [];
  porCategoria[r.categoria].push(r.fillRatio);
}
const promediosCat = Object.entries(porCategoria)
  .map(([cat, fills]) => ({
    cat,
    avg: Math.round(fills.reduce((a, b) => a + b, 0) / fills.length),
    count: fills.length,
  }))
  .sort((a, b) => a.avg - b.avg);

for (const { cat, avg, count } of promediosCat) {
  const bar = '█'.repeat(Math.round(avg / 5));
  console.log(`  ${String(avg).padStart(3)}%  ${bar.padEnd(20)}  ${cat} (${count})`);
}

console.log('\n');
