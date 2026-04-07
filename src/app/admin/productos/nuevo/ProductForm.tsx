'use client';

import { useFormState, useFormStatus } from 'react-dom';
import type { ProductFormState } from '@/app/admin/actions';
import type { CategoriaRow, ProductoRow } from '@/types/database';
import { useEffect, useState } from 'react';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-500/50 disabled:cursor-not-allowed text-black font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
    >
      {pending && (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {pending ? 'Guardando...' : label}
    </button>
  );
}

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

interface ProductFormProps {
  action: (prevState: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  categorias: CategoriaRow[];
  product?: ProductoRow;
  submitLabel?: string;
}

export default function ProductForm({ action, categorias, product, submitLabel = 'Crear producto' }: ProductFormProps) {
  const [state, formAction] = useFormState<ProductFormState, FormData>(action, {});
  const [nombre, setNombre] = useState(product?.nombre ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [slugEdited, setSlugEdited] = useState(!!product);
  const [activo, setActivo] = useState(product?.activo ?? true);

  useEffect(() => {
    if (!slugEdited) {
      setSlug(slugify(nombre));
    }
  }, [nombre, slugEdited]);

  const err = (field: string) => state.errors?.[field]?.[0];

  const inputClass = (field: string) =>
    `w-full bg-white/5 border rounded-lg px-3 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:ring-1 transition-colors ${
      err(field)
        ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/30'
        : 'border-white/10 focus:border-yellow-500/50 focus:ring-yellow-500/30'
    }`;

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Nombre */}
        <div className="md:col-span-2">
          <label className="block text-sm text-white/60 mb-1.5">
            Nombre <span className="text-red-400">*</span>
          </label>
          <input
            name="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={inputClass('nombre')}
            placeholder="Ej: Rodamiento Rígido de Bolas 6200"
          />
          {err('nombre') && <p className="text-red-400 text-xs mt-1">{err('nombre')}</p>}
        </div>

        {/* Slug */}
        <div className="md:col-span-2">
          <label className="block text-sm text-white/60 mb-1.5">
            Slug (URL) <span className="text-red-400">*</span>
          </label>
          <input
            name="slug"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
            className={inputClass('slug')}
            placeholder="rodamiento-rigido-bolas-6200"
          />
          <p className="text-white/25 text-xs mt-1">Solo letras minúsculas, números y guiones</p>
          {err('slug') && <p className="text-red-400 text-xs mt-1">{err('slug')}</p>}
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm text-white/60 mb-1.5">
            Categoría <span className="text-red-400">*</span>
          </label>
          <select
            name="categoria_id"
            defaultValue={product?.categoria_id ?? ''}
            className={inputClass('categoria_id')}
          >
            <option value="" disabled>Seleccionar categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          {err('categoria_id') && <p className="text-red-400 text-xs mt-1">{err('categoria_id')}</p>}
        </div>

        {/* Subcategoría */}
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Subcategoría</label>
          <input
            name="subcategoria"
            defaultValue={product?.subcategoria ?? ''}
            className={inputClass('subcategoria')}
            placeholder="Ej: rigidos-bolas"
          />
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm text-white/60 mb-1.5">
            Stock <span className="text-red-400">*</span>
          </label>
          <input
            name="stock"
            type="number"
            min="0"
            defaultValue={product?.stock ?? 0}
            className={inputClass('stock')}
          />
          {err('stock') && <p className="text-red-400 text-xs mt-1">{err('stock')}</p>}
        </div>

        {/* Precio */}
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Precio (ARS)</label>
          <input
            name="precio"
            type="number"
            min="0"
            step="0.01"
            defaultValue={product?.precio ?? ''}
            className={inputClass('precio')}
            placeholder="Dejar vacío si no aplica"
          />
          {err('precio') && <p className="text-red-400 text-xs mt-1">{err('precio')}</p>}
        </div>

        {/* Fabricante */}
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Fabricante</label>
          <input
            name="fabricante"
            defaultValue={product?.fabricante ?? ''}
            className={inputClass('fabricante')}
            placeholder="Ej: SKF / FAG / NSK"
          />
        </div>

        {/* Imagen URL */}
        <div>
          <label className="block text-sm text-white/60 mb-1.5">URL de imagen</label>
          <input
            name="imagen_url"
            type="url"
            defaultValue={product?.imagen_url ?? ''}
            className={inputClass('imagen_url')}
            placeholder="https://... o /images/products/..."
          />
          {err('imagen_url') && <p className="text-red-400 text-xs mt-1">{err('imagen_url')}</p>}
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <label className="block text-sm text-white/60 mb-1.5">Descripción corta</label>
          <textarea
            name="descripcion"
            defaultValue={product?.descripcion ?? ''}
            rows={2}
            className={inputClass('descripcion')}
            placeholder="Descripción breve del producto..."
          />
        </div>

        {/* Descripción larga */}
        <div className="md:col-span-2">
          <label className="block text-sm text-white/60 mb-1.5">Descripción completa</label>
          <textarea
            name="descripcion_larga"
            defaultValue={product?.descripcion_larga ?? ''}
            rows={4}
            className={inputClass('descripcion_larga')}
            placeholder="Descripción técnica detallada del producto..."
          />
        </div>
      </div>

      {/* Activo toggle */}
      <div className="flex items-center gap-3 pt-2">
        <input type="hidden" name="activo" value={activo ? 'true' : 'false'} />
        <button
          type="button"
          onClick={() => setActivo(!activo)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-150 focus:outline-none ${activo ? 'bg-yellow-500' : 'bg-white/20'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-150 ${activo ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
        <label className="text-sm text-white/60">
          Producto <span className={activo ? 'text-green-400' : 'text-white/30'}>{activo ? 'activo' : 'inactivo'}</span>
        </label>
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-3 pt-2 border-t border-white/10">
        <SubmitButton label={submitLabel} />
        <a
          href="/admin/productos"
          className="text-white/40 hover:text-white text-sm transition-colors"
        >
          Cancelar
        </a>
      </div>
    </form>
  );
}
