'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFormState, useFormStatus } from 'react-dom';
import {
  registrarMovimientoAction,
  buscarItemsPorCodigo,
  type MovimientoFormState,
  type ItemBusqueda,
} from '@/app/admin/stock/actions';

interface Proveedor {
  id: string;
  nombre: string;
}

const TIPOS = [
  { value: 'ingreso', label: 'Ingreso', desc: 'Recepción de mercadería' },
  { value: 'venta', label: 'Venta', desc: 'Salida por venta' },
  { value: 'devolucion', label: 'Devolución', desc: 'Retorno de cliente' },
  { value: 'ajuste', label: 'Ajuste', desc: 'Corrección de inventario' },
] as const;

type Tipo = (typeof TIPOS)[number]['value'];

const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30';

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-500/40 disabled:cursor-not-allowed text-black font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
    >
      {pending ? 'Registrando...' : 'Registrar movimiento'}
    </button>
  );
}

export default function NuevoMovimiento({ proveedores }: { proveedores: Proveedor[] }) {
  const router = useRouter();
  const [state, formAction] = useFormState<MovimientoFormState, FormData>(registrarMovimientoAction, {});
  const [tipo, setTipo] = useState<Tipo>('ingreso');

  useEffect(() => {
    if (state.success) router.push('/admin/movimientos');
  }, [state.success, router]);

  const [q, setQ] = useState('');
  const [resultados, setResultados] = useState<ItemBusqueda[]>([]);
  const [item, setItem] = useState<ItemBusqueda | null>(null);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    if (item || q.trim().length < 2) {
      setResultados([]);
      return;
    }
    setBuscando(true);
    const t = setTimeout(async () => {
      const r = await buscarItemsPorCodigo(q);
      setResultados(r);
      setBuscando(false);
    }, 250);
    return () => clearTimeout(t);
  }, [q, item]);

  const esEntrada = tipo === 'ingreso' || tipo === 'devolucion';

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
          {state.error}
        </div>
      )}

      {/* Selección de ítem */}
      <div>
        <label className="block text-sm text-white/60 mb-1.5">
          Ítem <span className="text-red-400">*</span>
        </label>
        {item ? (
          <div className="flex items-center justify-between bg-white/5 border border-yellow-500/40 rounded-lg px-3 py-2.5">
            <div>
              <span className="text-white font-mono text-sm">{item.codigo}</span>
              <span className="block text-white/40 text-xs">{item.nombre}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setItem(null);
                setQ('');
              }}
              className="text-white/40 hover:text-white text-xs"
            >
              Cambiar
            </button>
          </div>
        ) : (
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por código (ej: 6203)..."
              className={inputClass}
              autoComplete="off"
            />
            {(resultados.length > 0 || buscando) && (
              <div className="absolute z-10 mt-1 w-full bg-[#1f1f1f] border border-white/10 rounded-lg shadow-xl max-h-60 overflow-auto">
                {buscando && <div className="px-3 py-2 text-white/30 text-sm">Buscando...</div>}
                {resultados.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setItem(r);
                      setResultados([]);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-white/5 transition-colors"
                  >
                    <span className="text-white font-mono text-sm">{r.codigo}</span>
                    <span className="block text-white/40 text-xs">{r.nombre}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <input type="hidden" name="item_id" value={item?.id ?? ''} />
      </div>

      {/* Tipo */}
      <div>
        <label className="block text-sm text-white/60 mb-2">Tipo de movimiento</label>
        <div className="grid grid-cols-2 gap-2">
          {TIPOS.map((t) => (
            <label
              key={t.value}
              className={`flex flex-col gap-0.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                tipo === t.value ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-white/10 bg-white/[0.02] hover:bg-white/5'
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
          Cantidad {tipo === 'venta' && <span className="text-red-400/70 text-xs">(reduce el stock)</span>}
        </label>
        <input name="cantidad" type="number" min="1" required className={inputClass} placeholder="Ej: 5" />
      </div>

      {/* Dirección ajuste */}
      {tipo === 'ajuste' && (
        <div>
          <label className="block text-sm text-white/60 mb-2">Dirección del ajuste</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="direccion_ajuste" value="sumar" defaultChecked className="accent-yellow-400" />
              <span className="text-sm text-white/70">Aumentar</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="direccion_ajuste" value="restar" className="accent-yellow-400" />
              <span className="text-sm text-white/70">Reducir</span>
            </label>
          </div>
        </div>
      )}

      {/* Proveedor (entradas) */}
      {esEntrada && (
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Proveedor</label>
          <select name="proveedor_id" defaultValue="" className={inputClass}>
            <option value="">Sin especificar</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Cliente (ventas) */}
      {tipo === 'venta' && (
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Cliente</label>
          <input name="cliente_nombre" maxLength={150} className={inputClass} placeholder="Ej: Taller González" />
        </div>
      )}

      {/* Factura + precio */}
      {tipo !== 'ajuste' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Factura (N°)</label>
            <input name="factura" maxLength={60} className={inputClass} placeholder="Ej: A-0001-00001234" />
          </div>
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Precio unit. (ARS)</label>
            <input name="precio_unitario" type="number" min="0" step="0.01" className={inputClass} placeholder="Opcional" />
          </div>
        </div>
      )}

      {/* Nota */}
      <div>
        <label className="block text-sm text-white/60 mb-1.5">
          Nota <span className="text-white/30">(opcional)</span>
        </label>
        <input name="nota" maxLength={300} className={inputClass} placeholder="Nota opcional..." />
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-white/10">
        <SubmitButton disabled={!item} />
        <a href="/admin/movimientos" className="text-white/40 hover:text-white text-sm transition-colors">
          Cancelar
        </a>
      </div>
    </form>
  );
}
