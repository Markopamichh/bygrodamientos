'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  registrarMovimientoMultipleAction,
  buscarItemsPorCodigo,
  type MovimientoMultipleState,
  type ItemBusqueda,
} from '@/app/admin/stock/actions';

interface Proveedor {
  id: string;
  nombre: string;
}

const TIPOS = [
  { value: 'ingreso', label: 'Ingreso', desc: 'Compra / recepción' },
  { value: 'venta', label: 'Venta', desc: 'Salida por venta' },
  { value: 'devolucion', label: 'Devolución', desc: 'Retorno de cliente' },
  { value: 'ajuste', label: 'Ajuste', desc: 'Corrección de inventario' },
] as const;

type Tipo = (typeof TIPOS)[number]['value'];

/** Un renglón del movimiento. `key` es solo para React. */
interface Linea {
  key: number;
  item: ItemBusqueda | null;
  cantidad: string;
  precio: string;
}

const inputClass =
  'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white placeholder-white/25 text-sm focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30';

let nextKey = 1;
const nuevaLinea = (): Linea => ({ key: nextKey++, item: null, cantidad: '', precio: '' });

/** Buscador de ítem por código para un renglón. */
function BuscadorItem({
  value,
  onSelect,
  onClear,
}: {
  value: ItemBusqueda | null;
  onSelect: (i: ItemBusqueda) => void;
  onClear: () => void;
}) {
  const [q, setQ] = useState('');
  const [resultados, setResultados] = useState<ItemBusqueda[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResultados([]);
      return;
    }
    setBuscando(true);
    const t = setTimeout(async () => {
      const r = await buscarItemsPorCodigo(q);
      setResultados(r);
      setBuscando(false);
      setAbierto(true);
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  // Cerrar el desplegable al hacer clic afuera.
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  if (value) {
    return (
      <div className="flex items-center justify-between bg-white/5 border border-yellow-500/40 rounded-lg px-3 py-2">
        <div className="min-w-0">
          <span className="text-white font-mono text-sm">{value.codigo}</span>
          <span className="block text-white/40 text-xs truncate">{value.nombre}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            onClear();
            setQ('');
          }}
          className="text-white/40 hover:text-white text-xs shrink-0 ml-2"
        >
          Cambiar
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={boxRef}>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => resultados.length && setAbierto(true)}
        placeholder="Buscar por código..."
        className={inputClass}
        autoComplete="off"
      />
      {abierto && (resultados.length > 0 || buscando) && (
        <div className="absolute z-20 mt-1 w-full bg-[#1f1f1f] border border-white/10 rounded-lg shadow-xl max-h-56 overflow-auto">
          {buscando && <div className="px-3 py-2 text-white/30 text-sm">Buscando...</div>}
          {resultados.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                onSelect(r);
                setResultados([]);
                setAbierto(false);
              }}
              className="w-full text-left px-3 py-2 hover:bg-white/5 transition-colors"
            >
              <span className="text-white font-mono text-sm">{r.codigo}</span>
              <span className="block text-white/40 text-xs truncate">{r.nombre}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function NuevoMovimiento({ proveedores }: { proveedores: Proveedor[] }) {
  const router = useRouter();
  const [tipo, setTipo] = useState<Tipo>('ingreso');
  const [direccion, setDireccion] = useState<'sumar' | 'restar'>('sumar');
  const [proveedorId, setProveedorId] = useState('');
  const [cliente, setCliente] = useState('');
  const [factura, setFactura] = useState('');
  const [nota, setNota] = useState('');
  const [lineas, setLineas] = useState<Linea[]>([nuevaLinea()]);
  const [state, setState] = useState<MovimientoMultipleState>({});
  const [pending, setPending] = useState(false);

  const esEntrada = tipo === 'ingreso' || tipo === 'devolucion';

  const setLinea = (key: number, patch: Partial<Linea>) =>
    setLineas((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const total = lineas.reduce((acc, l) => {
    const c = Number(l.cantidad) || 0;
    const p = Number(l.precio) || 0;
    return acc + c * p;
  }, 0);

  const listas = lineas.filter((l) => l.item && Number(l.cantidad) >= 1);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setState({});
    const res = await registrarMovimientoMultipleAction({
      tipo,
      direccion_ajuste: tipo === 'ajuste' ? direccion : undefined,
      proveedor_id: esEntrada ? proveedorId || null : null,
      cliente_nombre: tipo === 'venta' ? cliente || null : null,
      factura: factura || null,
      nota: nota || null,
      lineas: listas.map((l) => ({
        item_id: l.item!.id,
        codigo: l.item!.codigo,
        cantidad: Number(l.cantidad),
        precio_unitario: l.precio === '' ? null : Number(l.precio),
      })),
    });
    setState(res);
    setPending(false);
    if (res.success && !res.fallidos?.length) router.push('/admin/movimientos');
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {state.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
          {state.error}
        </div>
      )}
      {state.fallidos?.length ? (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-yellow-300 text-sm space-y-1">
          <p className="font-medium">
            Se registraron {state.registrados} ítem{state.registrados !== 1 ? 's' : ''}, pero{' '}
            {state.fallidos.length} falló{state.fallidos.length !== 1 ? 'aron' : ''}:
          </p>
          {state.fallidos.map((f) => (
            <p key={f.codigo} className="text-xs">
              · <span className="font-mono">{f.codigo}</span>: {f.motivo}
            </p>
          ))}
          <a href="/admin/movimientos" className="inline-block mt-1 text-yellow-400 underline text-xs">
            Ir a movimientos
          </a>
        </div>
      ) : null}

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

      {/* Dirección ajuste */}
      {tipo === 'ajuste' && (
        <div>
          <label className="block text-sm text-white/60 mb-2">Dirección del ajuste</label>
          <div className="flex gap-4">
            {(['sumar', 'restar'] as const).map((d) => (
              <label key={d} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={direccion === d}
                  onChange={() => setDireccion(d)}
                  className="accent-yellow-400"
                />
                <span className="text-sm text-white/70">{d === 'sumar' ? 'Aumentar' : 'Reducir'} stock</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Cabecera: proveedor / cliente / factura */}
      <div className="bg-white/[0.02] border border-white/10 rounded-lg p-4 space-y-4">
        <p className="text-xs text-white/40 uppercase tracking-wider">
          Datos de la {esEntrada ? 'compra' : tipo === 'venta' ? 'venta' : 'operación'}
        </p>

        {esEntrada && (
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Proveedor</label>
            <select value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} className={inputClass}>
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
            <input
              value={cliente}
              onChange={(e) => setCliente(e.target.value)}
              maxLength={150}
              className={inputClass}
              placeholder="Ej: Taller González"
            />
          </div>
        )}

        {tipo !== 'ajuste' && (
          <div>
            <label className="block text-sm text-white/60 mb-1.5">Factura (N°)</label>
            <input
              value={factura}
              onChange={(e) => setFactura(e.target.value)}
              maxLength={60}
              className={inputClass}
              placeholder="Ej: A-0001-00001234"
            />
            <p className="text-white/25 text-xs mt-1">Se aplica a todos los ítems de abajo</p>
          </div>
        )}

        <div>
          <label className="block text-sm text-white/60 mb-1.5">
            Nota <span className="text-white/30">(opcional)</span>
          </label>
          <input
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            maxLength={300}
            className={inputClass}
            placeholder="Observaciones..."
          />
        </div>
      </div>

      {/* Renglones */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm text-white/60">
            Ítems <span className="text-white/30">({listas.length} cargado{listas.length !== 1 ? 's' : ''})</span>
          </label>
          <button
            type="button"
            onClick={() => setLineas((ls) => [...ls, nuevaLinea()])}
            className="flex items-center gap-1.5 text-yellow-400 hover:text-yellow-300 text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Agregar ítem
          </button>
        </div>

        <div className="space-y-2">
          {lineas.map((l, idx) => (
            <div key={l.key} className="bg-[#1a1a1a] border border-white/10 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <span className="text-white/25 text-xs mt-3 w-4 shrink-0">{idx + 1}</span>
                <div className="flex-1 min-w-0 space-y-2">
                  <BuscadorItem
                    value={l.item}
                    onSelect={(item) => setLinea(l.key, { item })}
                    onClear={() => setLinea(l.key, { item: null })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-white/40 mb-1">Cantidad</label>
                      <input
                        type="number"
                        min="1"
                        value={l.cantidad}
                        onChange={(e) => setLinea(l.key, { cantidad: e.target.value })}
                        className={inputClass}
                        placeholder="Ej: 5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/40 mb-1">Precio unit.</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={l.precio}
                        onChange={(e) => setLinea(l.key, { precio: e.target.value })}
                        className={inputClass}
                        placeholder="Opcional"
                      />
                    </div>
                  </div>
                </div>
                {lineas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setLineas((ls) => ls.filter((x) => x.key !== l.key))}
                    title="Quitar ítem"
                    className="p-1.5 mt-1 rounded text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {total > 0 && (
          <div className="flex justify-end mt-3 text-sm">
            <span className="text-white/40 mr-2">Total estimado:</span>
            <span className="text-white font-semibold">
              ${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2 border-t border-white/10">
        <button
          type="submit"
          disabled={pending || listas.length === 0}
          className="bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-500/40 disabled:cursor-not-allowed text-black font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          {pending
            ? 'Registrando...'
            : `Registrar ${listas.length || ''} ${listas.length === 1 ? 'ítem' : 'ítems'}`.trim()}
        </button>
        <a href="/admin/movimientos" className="text-white/40 hover:text-white text-sm transition-colors">
          Cancelar
        </a>
      </div>
    </form>
  );
}
