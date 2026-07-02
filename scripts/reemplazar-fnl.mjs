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
const MAPPING = [
  { file: '/tmp/fnl-tri.jpg', path: 'products/soportes-para-rodamientos/soportes-fnl722500-triangulares.webp' },
  { file: '/tmp/fnl-squ.jpg', path: 'products/soportes-para-rodamientos/soportes-fnl722500-cuadrados.webp' },
];

for (const { file, path } of MAPPING) {
  process.stdout.write(`  ${file} → ${path} ... `);
  const inner = await sharp(readFileSync(file))
    .trim({ background: '#ffffff', threshold: 20 })
    .resize(430, 430, { fit: 'inside', withoutEnlargement: false })
    .toBuffer();
  const meta = await sharp(inner).metadata();
  const buffer = await sharp(inner)
    .extend({
      top: Math.ceil((720 - meta.height) / 2),
      bottom: Math.floor((720 - meta.height) / 2),
      left: Math.ceil((720 - meta.width) / 2),
      right: Math.floor((720 - meta.width) / 2),
      background: '#ffffff',
    })
    .webp({ quality: 82 })
    .toBuffer();

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: 'image/webp',
    upsert: true,
  });
  console.log(error ? `✗ ${error.message}` : `✓ ${(buffer.length / 1024).toFixed(0)} KB`);
}
