'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

interface ImageUploadProps {
  existingUrl: string | null;
  onUploadStateChange: (isUploading: boolean) => void;
  error?: string;
}

export default function ImageUpload({ existingUrl, onUploadStateChange, error: fieldError }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(existingUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      setError('La imagen no puede superar 5MB');
      return;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Formato no soportado. Usá JPG, PNG, WebP o AVIF');
      return;
    }

    setError(null);
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    onUploadStateChange(true);

    const supabase = createClient();
    const safeName = file.name.replace(/[^a-z0-9._-]/gi, '_');
    const path = `products/${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
      setError('Error al subir imagen: ' + uploadError.message);
      setUploading(false);
      onUploadStateChange(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(path);

    setUploadedUrl(publicUrl);
    setUploading(false);
    onUploadStateChange(false);
  }

  function handleRemove() {
    setPreviewUrl(null);
    setUploadedUrl(null);
    setError(null);
  }

  return (
    <div>
      <label className="block text-sm text-white/60 mb-1.5">Imagen del producto</label>

      {previewUrl && (
        <div className="relative inline-block mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Preview"
            className="w-28 h-28 object-contain rounded-lg bg-white/5 border border-white/10"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none transition-colors"
            title="Quitar imagen"
          >
            ×
          </button>
        </div>
      )}

      <label className={`flex items-center gap-2 cursor-pointer w-fit ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <span className="bg-white/10 hover:bg-white/15 border border-white/10 text-white/70 text-sm px-3 py-2 rounded-lg transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {uploading ? 'Subiendo...' : previewUrl ? 'Cambiar imagen' : 'Seleccionar imagen'}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>

      <p className="text-white/25 text-xs mt-1.5">JPG, PNG, WebP o AVIF · Máximo 5MB</p>

      {uploading && (
        <p className="text-yellow-400 text-xs mt-1 flex items-center gap-1.5">
          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Subiendo imagen...
        </p>
      )}
      {(error || fieldError) && (
        <p className="text-red-400 text-xs mt-1">{error ?? fieldError}</p>
      )}

      <input type="hidden" name="imagen_url" value={uploadedUrl ?? ''} />
    </div>
  );
}
