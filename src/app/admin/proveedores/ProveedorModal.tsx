'use client';

import { useRef, useState } from 'react';
import { crearProveedorAction, editarProveedorAction, eliminarProveedorAction } from './actions';

interface Proveedor {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  sitio_web: string | null;
  contacto: string | null;
  notas: string | null;
}

interface Props {
  proveedor?: Proveedor;
  onClose: () => void;
}

export function ProveedorModal({ proveedor, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData(formRef.current);
      if (proveedor) {
        await editarProveedorAction(proveedor.id, fd);
      } else {
        await crearProveedorAction(fd);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold">{proveedor ? 'Editar proveedor' : 'Nuevo proveedor'}</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white p-1 rounded transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-white/40 mb-1.5 font-medium uppercase tracking-wider">Nombre *</label>
            <input name="nombre" required defaultValue={proveedor?.nombre} placeholder="Ej: SKF Argentina" className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500/50 placeholder-white/20" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium uppercase tracking-wider">Teléfono</label>
              <input name="telefono" defaultValue={proveedor?.telefono ?? ''} placeholder="+54 11 ..." className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500/50 placeholder-white/20" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium uppercase tracking-wider">Email</label>
              <input name="email" type="email" defaultValue={proveedor?.email ?? ''} placeholder="ventas@..." className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500/50 placeholder-white/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium uppercase tracking-wider">Sitio web</label>
              <input name="sitio_web" defaultValue={proveedor?.sitio_web ?? ''} placeholder="https://..." className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500/50 placeholder-white/20" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5 font-medium uppercase tracking-wider">Contacto</label>
              <input name="contacto" defaultValue={proveedor?.contacto ?? ''} placeholder="Nombre del vendedor" className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500/50 placeholder-white/20" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-white/40 mb-1.5 font-medium uppercase tracking-wider">Notas</label>
            <textarea name="notas" defaultValue={proveedor?.notas ?? ''} rows={3} placeholder="Condiciones, descuentos, plazos de entrega..." className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500/50 placeholder-white/20 resize-none" />
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-white/10 text-white/50 hover:text-white text-sm transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-sm transition-colors disabled:opacity-50">
              {loading ? 'Guardando...' : proveedor ? 'Guardar cambios' : 'Crear proveedor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteProveedorButton({ id, nombre }: { id: string; nombre: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${nombre}"?`)) return;
    setLoading(true);
    await eliminarProveedorAction(id);
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="p-1.5 rounded text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    </button>
  );
}
