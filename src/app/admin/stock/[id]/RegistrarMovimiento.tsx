'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useState, useEffect } from 'react';
import { registrarMovimientoAction, type MovimientoFormState } from '../actions';

interface Proveedor {
  id: string;
  nombre: string;
}

interface Props {
  itemId: string;
  proveedores: Proveedor[];
}

const TIPOS = [
  { value: 'ingreso', label: 'Ingreso', desc: 'Recepción de mercadería' },
  { value: 'venta', label: 'Venta', desc: 'Salida por venta' },
  { value: 'devolucion', label: 'Devolución', desc: 'Retorno de cliente' },
  { value: 'ajuste', label: 'Ajuste', desc: 'Corrección de inventario' },
] as const;

type Tipo = (typeof TIPOS)[number]['value'];

function ConfirmButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-500/50 disabled:cursor-not-allowed text-black font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
    >
      {pending && (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {pending ? 'Registrando...' : 'Confirmar movimiento'}
    </button>
  );
}

function MovimientoForm({
  itemId,
  proveedores,
  onSuccess,
}: {
  itemId: string;
  proveedores: Proveedor[];
  onSuccess: () => void;
}) {
  const [state, formAction] = useFormState<MovimientoFormState, FormData>(
    registrarMovimientoAction,
    {}
  );
  const [tipo, setTipo] = useState<Tipo>('ingreso');

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  const selectedTipo = TIPOS.find((t) => t.value === tipo)!;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="item_id" value={itemId} />

      {state.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
          {state.error}
        </div>
      )}

      {/* Tipo */}
      <div>
        <label className="block text-sm text-white/60 mb-2">Tipo de movimiento</label>
        <div className="grid grid-cols-2 gap-2">
          {TIPOS.map((t) => (
            <label
              key={t.value}
              className={`flex flex-col gap-0.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                tipo === t.value
                  ? 'border-yellow-500/50 bg-yellow-500/10'
                  : 'border-white/10 bg-white/[0.02] hover:bg-white/5'
              }`}
            >
              <input
                type="radio"
                name="tipo"
                value={t.value}
                checked={tipo === t.value}
                onChange={() => setTipo(t.value)}
                className="sr-only"
              />
              <span className={`text-sm font-medium ${tipo === t.value ? 'text-yellow-400' : 'text-white/80'}`}>
                {t.label}
              </span>
              <span className="text-xs text-white/30">{t.desc}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Cantidad */}
      <div>
        <label className="block text-sm text-white/60 mb-1.5">
          Cantidad{' '}
          {tipo === 'venta' && (
            <span className="text-red-400/70 text-xs">(reduce el stock)</span>
          )}
        </label>
        <input
          name="cantidad"
          type="number"
          min="1"
          required
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30"
          placeholder="Ej: 5"
        />
      </div>

      {/* Dirección para ajuste */}
      {tipo === 'ajuste' && (
        <div>
          <label className="block text-sm text-white/60 mb-2">Dirección del ajuste</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="direccion_ajuste"
                value="sumar"
                defaultChecked
                className="accent-yellow-400"
              />
              <span className="text-sm text-white/70">Aumentar stock</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="direccion_ajuste"
                value="restar"
                className="accent-yellow-400"
              />
              <span className="text-sm text-white/70">Reducir stock</span>
            </label>
          </div>
        </div>
      )}

      {/* Trazabilidad — Proveedor (solo entradas) */}
      {(tipo === 'ingreso' || tipo === 'devolucion') && (
        <div>
          <label className="block text-sm text-white/60 mb-1.5">
            Proveedor <span className="text-white/30">(a quién se le compró)</span>
          </label>
          <select
            name="proveedor_id"
            defaultValue=""
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30"
          >
            <option value="">Sin especificar</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Trazabilidad — Cliente (solo ventas) */}
      {tipo === 'venta' && (
        <div>
          <label className="block text-sm text-white/60 mb-1.5">
            Cliente <span className="text-white/30">(a quién se le vendió)</span>
          </label>
          <input
            name="cliente_nombre"
            type="text"
            maxLength={150}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30"
            placeholder="Ej: Taller González / Consumidor final"
          />
        </div>
      )}

      {/* Trazabilidad — Factura y precio (entradas y ventas) */}
      {tipo !== 'ajuste' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">
              Factura <span className="text-white/30">(N°)</span>
            </label>
            <input
              name="factura"
              type="text"
              maxLength={60}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30"
              placeholder="Ej: A-0001-00001234"
            />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">
              Precio unit. <span className="text-white/30">(ARS)</span>
            </label>
            <input
              name="precio_unitario"
              type="number"
              min="0"
              step="0.01"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30"
              placeholder="Opcional"
            />
          </div>
        </div>
      )}

      {/* Nota */}
      <div>
        <label className="block text-sm text-white/60 mb-1.5">
          Nota <span className="text-white/30">(opcional)</span>
        </label>
        <input
          name="nota"
          type="text"
          maxLength={300}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30"
          placeholder={
            tipo === 'venta'
              ? 'Ej: Venta mostrador'
              : tipo === 'ingreso'
              ? 'Ej: Factura #1234'
              : tipo === 'ajuste'
              ? 'Ej: Conteo físico'
              : 'Nota opcional...'
          }
        />
      </div>

      <div className="flex gap-3 pt-1">
        <ConfirmButton />
      </div>

      <p className="text-xs text-white/25">
        {selectedTipo.label} de{' '}
        {tipo === 'venta' || (tipo === 'ajuste')
          ? 'unidades'
          : 'unidades'}{' '}
        — actualiza el stock de forma atómica vía base de datos.
      </p>
    </form>
  );
}

export default function RegistrarMovimiento({ itemId, proveedores }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleOpen = () => {
    setFormKey((k) => k + 1);
    setIsOpen(true);
  };

  const handleClose = () => setIsOpen(false);

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors shrink-0"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
        </svg>
        Registrar movimiento
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="relative bg-[#1a1a1a] border border-white/10 rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h2 className="text-base font-semibold text-white">Registrar movimiento</h2>
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Cerrar"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5">
              <MovimientoForm key={formKey} itemId={itemId} proveedores={proveedores} onSuccess={handleClose} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
