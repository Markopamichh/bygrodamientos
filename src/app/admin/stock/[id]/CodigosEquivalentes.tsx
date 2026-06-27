'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useTransition, useEffect, useState } from 'react';
import {
  addCodigoEquivalenteAction,
  deleteCodigoEquivalenteAction,
  type CodigoEquivFormState,
} from '../actions';

interface Codigo {
  id: string;
  marca: string;
  codigo: string;
}

interface Props {
  itemId: string;
  codigos: Codigo[];
}

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      )}
      Agregar
    </button>
  );
}

function AddForm({ itemId, onSuccess }: { itemId: string; onSuccess: () => void }) {
  const [state, formAction] = useFormState<CodigoEquivFormState, FormData>(
    addCodigoEquivalenteAction,
    {}
  );

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} className="flex gap-2 flex-wrap">
      <input type="hidden" name="item_id" value={itemId} />
      <input
        name="marca"
        placeholder="Marca (ej: FAG)"
        required
        className="flex-1 min-w-28 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/25 text-sm focus:outline-none focus:border-yellow-500/50"
      />
      <input
        name="codigo"
        placeholder="Código (ej: 6204)"
        required
        className="flex-1 min-w-28 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/25 text-sm focus:outline-none focus:border-yellow-500/50"
      />
      <AddButton />
      {state.error && (
        <p className="w-full text-red-400 text-xs mt-1">{state.error}</p>
      )}
    </form>
  );
}

export default function CodigosEquivalentes({ itemId, codigos }: Props) {
  const [formKey, setFormKey] = useState(0);
  const resetForm = () => setFormKey((k) => k + 1);

  return (
    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
      <h2 className="text-sm font-semibold text-white mb-4">Códigos equivalentes</h2>

      {codigos.length > 0 ? (
        <div className="space-y-2 mb-4">
          {codigos.map((c) => (
            <CodigoRow key={c.id} codigo={c} itemId={itemId} />
          ))}
        </div>
      ) : (
        <p className="text-white/30 text-sm mb-4">
          Sin códigos equivalentes. Agregá uno para que también aparezca en búsquedas.
        </p>
      )}

      <AddForm key={formKey} itemId={itemId} onSuccess={resetForm} />
    </div>
  );
}

function CodigoRow({ codigo, itemId }: { codigo: Codigo; itemId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`¿Eliminar el código "${codigo.marca} ${codigo.codigo}"?`)) return;
    startTransition(async () => {
      const result = await deleteCodigoEquivalenteAction(codigo.id, itemId);
      if (result.error) alert(result.error);
    });
  };

  return (
    <div className="flex items-center gap-3 py-2 px-3 bg-white/[0.03] rounded-lg border border-white/5">
      <span className="text-xs text-white/40 w-20 shrink-0">{codigo.marca}</span>
      <span className="text-sm text-white/80 font-mono flex-1">{codigo.codigo}</span>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="p-1 rounded text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40"
        title="Eliminar código equivalente"
      >
        {isPending ? (
          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        )}
      </button>
    </div>
  );
}
