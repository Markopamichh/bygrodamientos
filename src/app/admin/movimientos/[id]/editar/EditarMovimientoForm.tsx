'use client';

import { useFormState, useFormStatus } from 'react-dom';
import type { MovimientoFormState } from '@/app/admin/stock/actions';

interface Proveedor {
  id: string;
  nombre: string;
}

interface Initial {
  proveedor_id: string;
  cliente_nombre: string;
  factura: string;
  precio_unitario: string;
  nota: string;
}

interface Props {
  action: (prev: MovimientoFormState, fd: FormData) => Promise<MovimientoFormState>;
  tipo: string;
  proveedores: Proveedor[];
  initial: Initial;
}

const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-500/50 text-black font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
    >
      {pending ? 'Guardando...' : 'Guardar cambios'}
    </button>
  );
}

export default function EditarMovimientoForm({ action, tipo, proveedores, initial }: Props) {
  const [state, formAction] = useFormState<MovimientoFormState, FormData>(action, {});
  const esEntrada = tipo === 'ingreso' || tipo === 'devolucion';

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
          {state.error}
        </div>
      )}

      {esEntrada && (
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Proveedor</label>
          <select name="proveedor_id" defaultValue={initial.proveedor_id} className={inputClass}>
            <option value="">Sin especificar</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {tipo === 'venta' && (
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Cliente</label>
          <input name="cliente_nombre" defaultValue={initial.cliente_nombre} maxLength={150} className={inputClass} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Factura</label>
          <input name="factura" defaultValue={initial.factura} maxLength={60} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Precio unit. (ARS)</label>
          <input
            name="precio_unitario"
            type="number"
            min="0"
            step="0.01"
            defaultValue={initial.precio_unitario}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-white/60 mb-1.5">Nota</label>
        <input name="nota" defaultValue={initial.nota} maxLength={300} className={inputClass} />
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-white/10">
        <SubmitButton />
        <a href={`/admin/movimientos`} className="text-white/40 hover:text-white text-sm transition-colors">
          Cancelar
        </a>
      </div>
    </form>
  );
}
