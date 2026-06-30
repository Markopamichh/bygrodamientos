// Restaura las imágenes de retenes descargándolas directamente de MR sin procesar.
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

const { data: retenes } = await supabase
  .from('productos')
  .select('id, slug, categoria_slug, imagen_url')
  .eq('categoria_slug', 'retenes')
  .eq('activo', true);

console.log(`\nRestaurando ${retenes.length} imágenes de retenes desde MR...\n`);

for (const p of retenes) {
  process.stdout.write(`  ${p.slug} ... `);

  // Intentar slug directo en MR
  const mrUrl = `https://mraccesoriosindustriales.com.ar/${p.slug}`;
  let imageUrl = null;

  try {
    const pageRes = await fetch(mrUrl, { signal: AbortSignal.timeout(10000) });
    if (pageRes.ok) {
      const html = await pageRes.text();
      // Buscar la URL de la imagen en el HTML de MR
      const match = html.match(/https:\/\/ss-cnt-001c\.esmsv\.com\/[^"'\s]+\.webp/);
      if (match) imageUrl = match[0];
    }
  } catch { /* slug no coincide en MR, skip */ }

  if (!imageUrl) {
    console.log('⚠ no encontrado en MR, se mantiene imagen actual');
    continue;
  }

  try {
    const imgRes = await fetch(imageUrl, { signal: AbortSignal.timeout(15000) });
    if (!imgRes.ok) throw new Error(`HTTP ${imgRes.status}`);

    // Reencoder con sharp (solo para asegurar formato consistente, sin ningún procesamiento)
    const original = Buffer.from(await imgRes.arrayBuffer());
    const buffer = await sharp(original).webp({ quality: 80 }).toBuffer();

    const storagePath = `products/${p.categoria_slug}/${p.slug}.webp`;
    const { error } = await supabase.storage
      .from('product-images')
      .upload(storagePath, buffer, { contentType: 'image/webp', upsert: true, cacheControl: '31536000' });

    if (error) throw new Error(error.message);

    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(storagePath);
    await supabase.from('productos').update({ imagen_url: publicUrl }).eq('id', p.id);

    console.log('✓');
  } catch (err) {
    console.log(`✗ ${err.message}`);
  }
}

console.log('\n── Listo ──\n');
