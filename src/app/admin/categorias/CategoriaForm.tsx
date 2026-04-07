'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import type { CategoriaFormState } from '@/app/admin/actions';
import { useEffect, useState } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-500/50 disabled:cursor-not-allowed text-black font-semibold py-2.5 rounded-lg text-sm transition-colors"
    >
      {pending ? 'Guardando...' : 'Agregar categoría'}
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

export default function CategoriaForm({
  action,
}: {
  action: (prev: CategoriaFormState, fd: FormData) => Promise<CategoriaFormState>;
}) {
  const [state, formAction] = useActionState<CategoriaFormState, FormData>(action, {});
  const [nombre, setNombre] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);

  useEffect(() => {
    if (!slugEdited) setSlug(slugify(nombre));
  }, [nombre, slugEdited]);

  useEffect(() => {
    if (state.success) {
      setNombre('');
      setSlug('');
      setSlugEdited(false);
    }
  }, [state.success]);

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
          placeholder="Ej: Rodamientos Industriales"
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
          placeholder="rodamientos-industriales"
        />
        {state.errors?.slug && <p className="text-red-400 text-xs mt-1">{state.errors.slug[0]}</p>}
      </div>

      <SubmitButton />
    </form>
  );
}
