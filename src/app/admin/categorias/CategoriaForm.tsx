'use client';

import { useFormState, useFormStatus } from 'react-dom';
import type { CategoriaFormState } from '@/app/admin/actions';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-500/50 disabled:cursor-not-allowed text-black font-semibold py-2.5 rounded-lg text-sm transition-colors"
    >
      {pending ? 'Guardando...' : disabled ? 'Subiendo imagen...' : 'Agregar categoría'}
    </button>
  );
}

export default function CategoriaForm({
  action,
}: {
  action: (prev: CategoriaFormState, fd: FormData) => Promise<CategoriaFormState>;
}) {
  const [state, formAction] = useFormState<CategoriaFormState, FormData>(action, {});
  const [nombre, setNombre] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  useEffect(() => {
    if (!slugEdited) setSlug(slugify(nombre));
  }, [nombre, slugEdited]);

  useEffect(() => {
    if (state.success) {
      setNombre('');
      setSlug('');
      setSlugEdited(false);
      setImageUrl(null);
      setPreviewUrl(null);
    }
  }, [state.success]);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE) { setImageError('Máximo 5MB'); return; }
    if (!ALLOWED_TYPES.includes(file.type)) { setImageError('Formato no soportado'); return; }

    setImageError(null);
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);

    const supabase = createClient();
    const safeName = file.name.replace(/[^a-z0-9._-]/gi, '_');
    const path = `categories/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage
      .from('product-images')
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (error) {
      setImageError('Error al subir: ' + error.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
    setImageUrl(publicUrl);
    setUploading(false);
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
          {state.error}
        </div>
      )}
      {state.success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm">
          Categoría creada correctamente
        </div>
      )}

      <div>
        <label className="block text-xs text-white/40 mb-1.5">Nombre</label>
        <input
          name="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/25 focus:outline-none focus:border-yellow-500/50"
          placeholder="Ej: Soportes para Rodamientos"
        />
        {state.errors?.nombre && <p className="text-red-400 text-xs mt-1">{state.errors.nombre[0]}</p>}
      </div>

      <div>
        <label className="block text-xs text-white/40 mb-1.5">Slug</label>
        <input
          name="slug"
          value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
          required
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white font-mono text-sm placeholder-white/25 focus:outline-none focus:border-yellow-500/50"
          placeholder="soportes-para-rodamientos"
        />
        {state.errors?.slug && <p className="text-red-400 text-xs mt-1">{state.errors.slug[0]}</p>}
      </div>

      <div>
        <label className="block text-xs text-white/40 mb-1.5">Imagen de la categoría</label>
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Preview" className="w-24 h-24 object-cover rounded-lg mb-2 border border-white/10" />
        )}
        <label className={`flex items-center gap-2 w-fit cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <span className="bg-white/10 hover:bg-white/15 border border-white/10 text-white/70 text-xs px-3 py-2 rounded-lg transition-colors flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {uploading ? 'Subiendo...' : previewUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handleImageChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
        <p className="text-white/20 text-xs mt-1">JPG, PNG, WebP · Máx 5MB</p>
        {imageError && <p className="text-red-400 text-xs mt-1">{imageError}</p>}
        <input type="hidden" name="imagen_url" value={imageUrl ?? ''} />
      </div>

      <SubmitButton disabled={uploading} />
    </form>
  );
}
