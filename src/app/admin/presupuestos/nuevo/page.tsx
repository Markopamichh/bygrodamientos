'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { crearCliente } from '../actions';

interface Cliente { id: string; nombre: string; razon_social: string | null; cuit_cuil: string | null; email: string | null; condicion_iva: string; }
interface Item { descripcion: string; cantidad: number; precio_unitario: number; }
interface NuevoCliente { nombre: string; razon_social: string; cuit_cuil: string; email: string; telefono: string; condicion_iva: string; }

const DIAS_VALIDEZ = 7;
const IVA_OPTS = ['responsable_inscripto', 'monotributista', 'consumidor_final', 'exento'] as const;
const IVA_LABELS: Record<string, string> = {
  responsable_inscripto: 'Responsable Inscripto',
  monotributista: 'Monotributista',
  consumidor_final: 'Consumidor Final',
  exento: 'Exento',
};

export default function NuevoPresupuestoPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState('');
  const [nuevoCliente, setNuevoCliente] = useState<NuevoCliente>({
    nombre: '', razon_social: '', cuit_cuil: '', email: '', telefono: '', condicion_iva: 'responsable_inscripto',
  });
  const esNuevoCliente = clienteId === '__nuevo__';
  const [condPago, setCondPago] = useState('Contado');
  const [descuentoPct, setDescuentoPct] = useState(0);
  const [ivaPct, setIvaPct] = useState(21);
  const [notas, setNotas] = useState('');
  const [items, setItems] = useState<Item[]>([{ descripcion: '', cantidad: 1, precio_unitario: 0 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setNC(field: keyof NuevoCliente, value: string) {
    setNuevoCliente(prev => ({ ...prev, [field]: value }));
  }

  function handleClienteSelect(val: string) {
    setClienteId(val);
    // Pre-rellenar nombre si escribe algo antes de elegir
    if (val !== '__nuevo__') setNuevoCliente({ nombre: '', razon_social: '', cuit_cuil: '', email: '', telefono: '', condicion_iva: 'responsable_inscripto' });
  }

  useEffect(() => {
    createClient().from('clientes').select('id, nombre, razon_social, cuit_cuil, email, condicion_iva').eq('activo', true).order('nombre')
      .then(({ data }) => setClientes((data as Cliente[]) ?? []));
  }, []);

  // Cálculos
  const subtotal = items.reduce((s, i) => s + i.cantidad * i.precio_unitario, 0);
  const descuentoMonto = subtotal * (descuentoPct / 100);
  const baseIva = subtotal - descuentoMonto;
  const ivaMonto = baseIva * (ivaPct / 100);
  const total = baseIva + ivaMonto;

  function addItem() { setItems(prev => [...prev, { descripcion: '', cantidad: 1, precio_unitario: 0 }]); }
  function removeItem(i: number) { setItems(prev => prev.filter((_, idx) => idx !== i)); }
  function updateItem(i: number, field: keyof Item, value: string | number) {
    setItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  }

  async function handleGuardar(estado: 'borrador' | 'enviado') {
    if (!clienteId) { setError('Seleccioná un cliente'); return; }
    if (esNuevoCliente && !nuevoCliente.nombre.trim()) { setError('Ingresá el nombre del cliente'); return; }
    if (items.every(i => !i.descripcion)) { setError('Agregá al menos un ítem'); return; }
    setLoading(true); setError(null);

    const sb = createClient();

    // Si es cliente nuevo, crearlo primero via server action (admin client)
    let idCliente = clienteId;
    if (esNuevoCliente) {
      const result = await crearCliente(nuevoCliente);
      if ('error' in result) { setError(result.error); setLoading(false); return; }
      idCliente = result.id;
    }
    const hoy = new Date();
    const vence = new Date(hoy); vence.setDate(hoy.getDate() + DIAS_VALIDEZ);

    const { data: pres, error: err1 } = await sb.from('presupuestos').insert({
      cliente_id: idCliente,
      condicion_pago: condPago,
      descuento_pct: descuentoPct,
      iva_pct: ivaPct,
      notas: notas || null,
      estado,
      subtotal,
      descuento_monto: descuentoMonto,
      iva_monto: ivaMonto,
      total,
      fecha_vencimiento: vence.toISOString().split('T')[0],
    }).select('id').single();

    if (err1 || !pres) { setError(err1?.message ?? 'Error al crear presupuesto'); setLoading(false); return; }

    const { error: err2 } = await sb.from('presupuesto_items').insert(
      items.filter(i => i.descripcion).map((item, idx) => ({
        presupuesto_id: pres.id,
        descripcion: item.descripcion,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        orden: idx,
      }))
    );

    if (err2) { setError(err2.message); setLoading(false); return; }
    router.push(`/admin/presupuestos/${pres.id}`);
  }

  const clienteSelec = clientes.find(c => c.id === clienteId);

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Nuevo presupuesto</h1>
          <p className="text-white/40 text-sm">Válido por {DIAS_VALIDEZ} días desde hoy</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">

          {/* Cliente */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Cliente</h2>

            <select
              value={clienteId}
              onChange={e => handleClienteSelect(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500/50 mb-3"
            >
              <option value="">— Seleccioná un cliente —</option>
              <option value="__nuevo__">+ Nuevo cliente</option>
              {clientes.length > 0 && <option disabled>──────────────</option>}
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.razon_social ?? c.nombre}{c.cuit_cuil ? ` (${c.cuit_cuil})` : ''}</option>
              ))}
            </select>

            {/* Cliente existente seleccionado */}
            {clienteSelec && (
              <div className="bg-[#111] rounded-lg px-4 py-3 space-y-1">
                <p className="text-white/70 text-sm font-medium">{clienteSelec.razon_social ?? clienteSelec.nombre}</p>
                {clienteSelec.cuit_cuil && <p className="text-white/40 text-xs">CUIT/CUIL: {clienteSelec.cuit_cuil}</p>}
                {clienteSelec.email && <p className="text-white/40 text-xs">{clienteSelec.email}</p>}
              </div>
            )}

            {/* Formulario cliente nuevo */}
            {esNuevoCliente && (
              <div className="space-y-3 border border-yellow-500/20 rounded-lg p-4 bg-yellow-500/5">
                <p className="text-yellow-400 text-xs font-semibold uppercase tracking-wider">Datos del nuevo cliente</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Nombre *</label>
                    <input
                      value={nuevoCliente.nombre}
                      onChange={e => setNC('nombre', e.target.value)}
                      placeholder="Juan García"
                      className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50 placeholder-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Razón social</label>
                    <input
                      value={nuevoCliente.razon_social}
                      onChange={e => setNC('razon_social', e.target.value)}
                      placeholder="Empresa S.A."
                      className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50 placeholder-white/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1">CUIT / CUIL</label>
                    <input
                      value={nuevoCliente.cuit_cuil}
                      onChange={e => setNC('cuit_cuil', e.target.value)}
                      placeholder="20-12345678-9"
                      className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50 placeholder-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Condición IVA</label>
                    <select
                      value={nuevoCliente.condicion_iva}
                      onChange={e => setNC('condicion_iva', e.target.value)}
                      className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                    >
                      {IVA_OPTS.map(o => <option key={o} value={o}>{IVA_LABELS[o]}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Email</label>
                    <input
                      type="email"
                      value={nuevoCliente.email}
                      onChange={e => setNC('email', e.target.value)}
                      placeholder="correo@empresa.com"
                      className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50 placeholder-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/40 mb-1">Teléfono</label>
                    <input
                      value={nuevoCliente.telefono}
                      onChange={e => setNC('telefono', e.target.value)}
                      placeholder="299 4123456"
                      className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50 placeholder-white/20"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Ítems */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Ítems</h2>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6">
                    <input
                      value={item.descripcion}
                      onChange={e => updateItem(i, 'descripcion', e.target.value)}
                      placeholder="Descripción del producto o servicio"
                      className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50 placeholder-white/20"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number" min="0.01" step="0.01" value={item.cantidad}
                      onChange={e => updateItem(i, 'cantidad', parseFloat(e.target.value) || 0)}
                      className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50 text-center"
                    />
                  </div>
                  <div className="col-span-3">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">$</span>
                      <input
                        type="number" min="0" step="0.01" value={item.precio_unitario}
                        onChange={e => updateItem(i, 'precio_unitario', parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#111] border border-white/10 rounded-lg pl-6 pr-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500/50"
                      />
                    </div>
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {items.length > 1 && (
                      <button onClick={() => removeItem(i)} className="p-1.5 rounded text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                  {/* subtotal fila */}
                  <div className="col-span-12 flex justify-end pr-8">
                    <span className="text-white/30 text-xs">= ${(item.cantidad * item.precio_unitario).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={addItem} className="mt-4 flex items-center gap-2 text-yellow-400 hover:text-yellow-300 text-sm transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
              Agregar ítem
            </button>
          </div>

          {/* Notas */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
            <h2 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Notas / Observaciones</h2>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={3}
              placeholder="Condiciones, aclaraciones, plazos de entrega..."
              className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500/50 placeholder-white/20 resize-none" />
          </div>
        </div>

        {/* Panel lateral — totales y acciones */}
        <div className="space-y-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 space-y-4">
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Condiciones</h2>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Condición de pago</label>
              <select value={condPago} onChange={e => setCondPago(e.target.value)}
                className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500/50">
                <option>Contado</option>
                <option>30 días</option>
                <option>60 días</option>
                <option>A convenir</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Descuento (%)</label>
              <input type="number" min="0" max="100" value={descuentoPct} onChange={e => setDescuentoPct(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500/50" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">IVA (%)</label>
              <select value={ivaPct} onChange={e => setIvaPct(parseFloat(e.target.value))}
                className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500/50">
                <option value={21}>21%</option>
                <option value={10.5}>10.5%</option>
                <option value={0}>Sin IVA</option>
              </select>
            </div>
          </div>

          {/* Totales */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Subtotal</span>
              <span className="text-white/70">${subtotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
            {descuentoPct > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Descuento ({descuentoPct}%)</span>
                <span className="text-red-400">-${descuentoMonto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            {ivaPct > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-white/40">IVA ({ivaPct}%)</span>
                <span className="text-white/70">${ivaMonto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
              <span className="text-white font-bold">TOTAL</span>
              <span className="text-yellow-400 font-bold text-lg">${total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}

          <div className="space-y-2">
            <button onClick={() => handleGuardar('borrador')} disabled={loading}
              className="w-full py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 text-sm font-medium transition-colors disabled:opacity-50">
              Guardar borrador
            </button>
            <button onClick={() => handleGuardar('enviado')} disabled={loading}
              className="w-full py-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm transition-colors disabled:opacity-50">
              {loading ? 'Guardando...' : 'Guardar y marcar como enviado'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
