'use client';

import { useState } from 'react';
import { eliminarMovimientoAction } from '@/app/admin/stock/actions';

export default function EliminarMovimiento({ id }: { id: string }) {
  const [confirmar, setConfirmar] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onDelete() {
    setPending(true);
    setError(null);
    try {
      await eliminarMovimientoAction(id);
    } catch (e) {
      // redirect() lanza una excepción interna de Next que hay que dejar propagar.
      if (e && typeof e === 'object' && 'digest' in e && String((e as { digest: string }).digest).startsWith('NEXT_REDIRECT')) {
        throw e;
      }
      setError(e instanceof Error ? e.message : 'No se pudo eliminar');
      setPending(false);
    }
  }

  if (!confirmar) {
    return (
      <button
        onClick={() => setConfirmar(true)}
        className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-lg text-sm transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
        Eliminar
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-red-400 text-xs">{error}</span>}
      <span className="text-white/60 text-sm">¿Revertir stock y eliminar?</span>
      <button
        onClick={onDelete}
        disabled={pending}
        className="bg-red-500 hover:bg-red-400 disabled:opacity-50 text-white font-semibold px-3 py-2 rounded-lg text-sm"
      >
        {pending ? 'Eliminando...' : 'Sí, eliminar'}
      </button>
      <button
        onClick={() => setConfirmar(false)}
        disabled={pending}
        className="text-white/40 hover:text-white text-sm px-2"
      >
        Cancelar
      </button>
    </div>
  );
}
