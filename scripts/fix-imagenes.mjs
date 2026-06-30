// Script:
//   1. Agrega fondo blanco con padding a imágenes de categorías de objetos pequeños (retenes).
//   2. Limpia imagen_url de productos específicos con logo de proveedor visible.
//
// Uso: node scripts/fix-imagenes.mjs

import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'module';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const sharp = require('sharp');

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

const BUCKET = 'product-images';
const CANVAS = 720;
const MARGIN = Math.round(CANVAS * 0.06); // 6% de margen en cada lado (~43px)

// ── 1. Recortar espacio blanco y agregar margen mínimo a retenes ─────────────
const CATEGORIAS_PADDING = ['retenes'];

const { data: productosPadding } = await supabase
  .from('productos')
  .select('id, slug, categoria_slug, imagen_url')
  .in('categoria_slug', CATEGORIAS_PADDING)
  .not('imagen_url', 'is', null)
  .neq('imagen_url', '')
  .eq('activo', true);

console.log(`\n── Agregando fondo blanco a ${productosPadding.length} imágenes de retenes ──`);

for (const p of productosPadding) {
  process.stdout.write(`  ${p.slug} ... `);
  try {
    const res = await fetch(p.imagen_url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const original = Buffer.from(await res.arrayBuffer());

    // 1. Recortar espacio blanco → queda solo el producto
    const trimmed = await sharp(original)
      .trim({ background: '#ffffff', threshold: 20 })
      .toBuffer();

    // 2. Escalar el producto para que quepa en un cuadrado de innerSize×innerSize
    const innerSize = CANVAS - MARGIN * 2; // 720 - 86 = 634px
    const resized = await sharp(trimmed)
      .resize(innerSize, innerSize, { fit: 'inside', withoutEnlargement: false })
      .toBuffer();

    // 3. Centrar en canvas cuadrado 720×720 con fondo blanco
    const { width: rw, height: rh } = await sharp(resized).metadata();
    const padLeft   = Math.floor((CANVAS - rw) / 2);
    const padRight  = CANVAS - rw - padLeft;
    const padTop    = Math.floor((CANVAS - rh) / 2);
    const padBottom = CANVAS - rh - padTop;

    const buffer = await sharp(resized)
      .extend({
        top:    padTop,
        bottom: padBottom,
        left:   padLeft,
        right:  padRight,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .webp({ quality: 82 })
      .toBuffer();

    const storagePath = `products/${p.categoria_slug}/${p.slug}-opt.webp`;
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, { contentType: 'image/webp', upsert: true, cacheControl: '31536000' });

    if (error) throw new Error(error.message);

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    await supabase.from('productos').update({ imagen_url: publicUrl }).eq('id', p.id);

    console.log('✓');
  } catch (err) {
    console.log(`✗ ${err.message}`);
  }
}

// ── 2. Limpiar imagen_url de productos con logo visible ───────────────────────
const SLUGS_SIN_IMAGEN = [
  'rodamientos-a-bolas',
  'rodamientos-de-rodillos-conicos',
];

console.log(`\n── Limpiando imagen de ${SLUGS_SIN_IMAGEN.length} productos con logo MR ──`);

for (const slug of SLUGS_SIN_IMAGEN) {
  const { error } = await supabase
    .from('productos')
    .update({ imagen_url: null })
    .eq('slug', slug);

  if (error) {
    console.log(`  ✗ ${slug}: ${error.message}`);
  } else {
    console.log(`  ✓ ${slug} → imagen_url = null`);
  }
}

console.log('\n── Listo ──\n');
