'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchPresupuesto, actualizarEstadoPresupuesto, eliminarPresupuesto } from '../actions';

interface Item { id: string; descripcion: string; cantidad: number; precio_unitario: number; subtotal: number; }
interface Presupuesto {
  id: string; numero: number; estado: string;
  fecha_emision: string; fecha_vencimiento: string | null;
  condicion_pago: string; descuento_pct: number; iva_pct: number;
  subtotal: number; descuento_monto: number; iva_monto: number; total: number;
  notas: string | null;
  clientes: { nombre: string; razon_social: string | null; cuit_cuil: string | null; email: string | null; telefono: string | null; condicion_iva: string; } | null;
}

const ESTADO_CONFIG: Record<string, { label: string; color: string; next?: string }> = {
  borrador:  { label: 'Borrador',  color: 'bg-white/10 text-white/50',          next: 'enviado' },
  enviado:   { label: 'Enviado',   color: 'bg-blue-500/15 text-blue-400',       next: 'aceptado' },
  aceptado:  { label: 'Aceptado', color: 'bg-emerald-500/15 text-emerald-400' },
  rechazado: { label: 'Rechazado',color: 'bg-red-500/15 text-red-400' },
  vencido:   { label: 'Vencido',  color: 'bg-orange-500/15 text-orange-400' },
};

const IVA_LABELS: Record<string, string> = {
  responsable_inscripto: 'Resp. Inscripto', monotributista: 'Monotributista',
  consumidor_final: 'Consumidor Final', exento: 'Exento',
};

export default function PresupuestoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [pres, setPres] = useState<Presupuesto | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function cargar() {
    const { pres: p, items: it } = await fetchPresupuesto(id);
    setPres(p as unknown as Presupuesto);
    setItems((it as Item[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { cargar(); }, [id]);

  async function cambiarEstado(nuevo: string) {
    await actualizarEstadoPresupuesto(id, nuevo);
    cargar();
  }

  async function enviarEmail() {
    setEnviando(true); setEmailMsg(null);
    const res = await fetch('/api/presupuestos/enviar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ presupuestoId: id }),
    });
    const data = await res.json();
    if (res.ok) {
      setEmailMsg({ ok: true, text: `Email enviado a ${pres?.clientes?.email}` });
      cargar();
    } else {
      setEmailMsg({ ok: false, text: data.error ?? 'Error al enviar' });
    }
    setEnviando(false);
  }

  async function eliminar() {
    if (!confirm('¿Eliminar este presupuesto?')) return;
    await eliminarPresupuesto(id);
    router.push('/admin/presupuestos');
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
    </div>
  );
  if (!pres) return <div className="p-8 text-white/40">Presupuesto no encontrado</div>;

  const cfg = ESTADO_CONFIG[pres.estado] ?? ESTADO_CONFIG.borrador;
  const clienteNombre = pres.clientes?.razon_social ?? pres.clientes?.nombre ?? 'Sin cliente';
  const numero = `P-${String(pres.numero).padStart(4, '0')}`;

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{numero}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
            </div>
            <p className="text-white/40 text-sm mt-0.5">
              Emitido: {new Date(pres.fecha_emision).toLocaleDateString('es-AR')}
              {pres.fecha_vencimiento && ` · Vence: ${new Date(pres.fecha_vencimiento).toLocaleDateString('es-AR')}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Enviar por email */}
          {pres.clientes?.email && (
            <button onClick={enviarEmail} disabled={enviando}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 hover:bg-blue-500/25 text-sm font-medium transition-colors disabled:opacity-50">
              {enviando ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )}
              {enviando ? 'Enviando...' : 'Enviar por email'}
            </button>
          )}
          {cfg.next && (
            <button onClick={() => cambiarEstado(cfg.next!)}
              className="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-sm transition-colors">
              Marcar como {ESTADO_CONFIG[cfg.next]?.label}
            </button>
          )}
          {pres.estado !== 'rechazado' && pres.estado !== 'vencido' && (
            <button onClick={() => cambiarEstado('rechazado')}
              className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-400/10 text-sm transition-colors">
              Rechazar
            </button>
          )}
          <button onClick={eliminar}
            className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-400/10 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916" />
            </svg>
          </button>
        </div>
      </div>

      {emailMsg && (
        <div className={`mb-6 px-4 py-3 rounded-lg text-sm flex items-center gap-2 ${emailMsg.ok ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
          {emailMsg.ok
            ? <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            : <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          }
          {emailMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Cliente */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
            <h2 className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-3">Cliente</h2>
            <p className="text-white font-semibold">{clienteNombre}</p>
            {pres.clientes?.cuit_cuil && <p className="text-white/40 text-sm mt-1">CUIT/CUIL: {pres.clientes.cuit_cuil}</p>}
            {pres.clientes?.condicion_iva && <p className="text-white/40 text-sm">{IVA_LABELS[pres.clientes.condicion_iva] ?? pres.clientes.condicion_iva}</p>}
            <div className="flex gap-4 mt-3">
              {pres.clientes?.email && (
                <a href={`mailto:${pres.clientes.email}`} className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {pres.clientes.email}
                </a>
              )}
              {pres.clientes?.telefono && (
                <a href={`https://wa.me/${pres.clientes.telefono.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#25D366] hover:text-[#1da851] text-sm transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Ítems */}
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-white/10">
              <h2 className="text-xs text-white/40 font-semibold uppercase tracking-wider">Detalle</h2>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-5 py-2.5 text-xs text-white/30 font-medium">Descripción</th>
                  <th className="text-center px-3 py-2.5 text-xs text-white/30 font-medium">Cant.</th>
                  <th className="text-right px-3 py-2.5 text-xs text-white/30 font-medium">Precio u.</th>
                  <th className="text-right px-5 py-2.5 text-xs text-white/30 font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="px-5 py-3 text-white/80 text-sm">{item.descripcion}</td>
                    <td className="px-3 py-3 text-white/50 text-sm text-center">{item.cantidad}</td>
                    <td className="px-3 py-3 text-white/50 text-sm text-right">${Number(item.precio_unitario).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                    <td className="px-5 py-3 text-white/80 text-sm text-right font-medium">${Number(item.subtotal).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pres.notas && (
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
              <h2 className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">Notas</h2>
              <p className="text-white/60 text-sm leading-relaxed">{pres.notas}</p>
            </div>
          )}
        </div>

        {/* Totales */}
        <div className="space-y-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5 space-y-3">
            <h2 className="text-xs text-white/40 font-semibold uppercase tracking-wider">Resumen</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/40">Subtotal</span>
                <span className="text-white/70">${Number(pres.subtotal).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
              {pres.descuento_pct > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Desc. ({pres.descuento_pct}%)</span>
                  <span className="text-red-400">-${Number(pres.descuento_monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              {pres.iva_pct > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">IVA ({pres.iva_pct}%)</span>
                  <span className="text-white/70">${Number(pres.iva_monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-white/10 pt-2">
                <span className="text-white font-bold">TOTAL</span>
                <span className="text-yellow-400 font-bold text-lg">${Number(pres.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-white/10 text-xs text-white/30 space-y-1">
              <p>Condición de pago: <span className="text-white/50">{pres.condicion_pago}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
