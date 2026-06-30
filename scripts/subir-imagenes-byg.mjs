import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'module';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';

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

const IMAGES_DIR = '/Users/markopamich/Desktop/imagenes byg';
const BUCKET = 'product-images';

// Mapeo archivo → producto en la DB
const MAPPING = [
  { file: 'nitrilo.webp',           slug: 'nitrilo',                          categoria: 'retenes' },
  { file: 'poliacrilico.webp',       slug: 'poliacrilico',                     categoria: 'retenes' },
  { file: 'silicona.webp',           slug: 'silicona',                         categoria: 'retenes' },
  { file: 'viton.webp',              slug: 'viton',                            categoria: 'retenes' },
  { file: 'a bolas.webp',            slug: 'rodamientos-a-bolas',              categoria: 'rodamientos' },
  { file: 'conicos.webp',            slug: 'rodamientos-de-rodillos-conicos',  categoria: 'rodamientos' },
  { file: 'rodmientos a bola.webp',  slug: 'rigidos-de-bolas',                 categoria: 'rodamientos' },
];

console.log('\n── Subiendo imágenes BYG a Supabase Storage ──\n');

for (const { file, slug, categoria } of MAPPING) {
  const filePath = join(IMAGES_DIR, file);
  process.stdout.write(`  ${file} → ${slug} ... `);

  if (!existsSync(filePath)) {
    console.log('⚠ archivo no encontrado, skip');
    continue;
  }

  try {
    const original = readFileSync(filePath);

    // Optimizar con sharp: retenes object-cover → recortar bien; resto object-contain
    const isReten = categoria === 'retenes';
    const buffer = await sharp(original)
      .trim({ background: '#ffffff', threshold: 20 })
      .resize(720, 720, { fit: isReten ? 'cover' : 'inside', withoutEnlargement: false })
      .webp({ quality: 82 })
      .toBuffer();

    // Nombre con sufijo -byg para evitar caché CDN
    const storagePath = `products/${categoria}/${slug}-byg.webp`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: 'image/webp',
        upsert: true,
        cacheControl: '3600',
      });

    if (uploadError) throw new Error(uploadError.message);

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

    const { error: dbError } = await supabase
      .from('productos')
      .update({ imagen_url: publicUrl })
      .eq('slug', slug);

    if (dbError) throw new Error(dbError.message);

    console.log('✓');
  } catch (err) {
    console.log(`✗ ${err.message}`);
  }
}

console.log('\n── Listo ──\n');
