'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

interface Presupuesto {
  id: string;
  numero: number;
  estado: string;
  fecha_emision: string;
  fecha_vencimiento: string | null;
  total: number;
  clientes: { nombre: string; razon_social: string | null } | null;
}

const ESTADO_CONFIG: Record<string, { label: string; color: string }> = {
  borrador:  { label: 'Borrador',  color: 'bg-white/10 text-white/50' },
  enviado:   { label: 'Enviado',   color: 'bg-blue-500/15 text-blue-400' },
  aceptado:  { label: 'Aceptado', color: 'bg-emerald-500/15 text-emerald-400' },
  rechazado: { label: 'Rechazado',color: 'bg-red-500/15 text-red-400' },
  vencido:   { label: 'Vencido',  color: 'bg-orange-500/15 text-orange-400' },
};

export default function PresupuestosPage() {
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');

  useEffect(() => {
    async function cargar() {
      const sb = createClient();
      const { data } = await sb
        .from('presupuestos')
        .select('id, numero, estado, fecha_emision, fecha_vencimiento, total, clientes(nombre, razon_social)')
        .order('numero', { ascending: false });
      setPresupuestos((data as unknown as Presupuesto[]) ?? []);
      setLoading(false);
    }
    cargar();
  }, []);

  const filtrados = presupuestos.filter(p => !filtroEstado || p.estado === filtroEstado);

  // Totales por estado
  const totales = presupuestos.reduce((acc, p) => {
    acc[p.estado] = (acc[p.estado] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Presupuestos</h1>
          <p className="text-white/40 text-sm mt-0.5">{presupuestos.length} presupuesto{presupuestos.length !== 1 ? 's' : ''}</p>
        </div>
        <Link href="/admin/presupuestos/nuevo"
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo presupuesto
        </Link>
      </div>

      {/* KPIs de estado */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {Object.entries(ESTADO_CONFIG).map(([key, cfg]) => (
          <button key={key} onClick={() => setFiltroEstado(filtroEstado === key ? '' : key)}
            className={`rounded-xl px-4 py-3 text-left transition-all border ${
              filtroEstado === key ? 'border-yellow-500/50 bg-yellow-500/10' : 'border-white/10 bg-[#1a1a1a] hover:border-white/20'
            }`}>
            <p className="text-white/40 text-xs mb-1">{cfg.label}</p>
            <p className="text-white font-bold text-xl">{totales[key] ?? 0}</p>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl py-16 text-center">
          <p className="text-white/30 text-sm mb-3">{filtroEstado ? 'Sin presupuestos con ese estado' : 'No hay presupuestos todavía'}</p>
          {!filtroEstado && (
            <Link href="/admin/presupuestos/nuevo" className="text-yellow-400 text-sm hover:text-yellow-300">Crear el primero →</Link>
          )}
        </div>
      ) : (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider">Nº</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider">Cliente</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider hidden sm:table-cell">Fecha</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider hidden md:table-cell">Vence</th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider">Estado</th>
                <th className="text-right px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider">Total</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtrados.map(p => {
                const cfg = ESTADO_CONFIG[p.estado] ?? ESTADO_CONFIG.borrador;
                const clienteNombre = p.clientes?.razon_social ?? p.clientes?.nombre ?? 'Sin cliente';
                return (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-white/60 font-mono text-sm">P-{String(p.numero).padStart(4, '0')}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white/80 text-sm">{clienteNombre}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-white/40 text-sm">{new Date(p.fecha_emision).toLocaleDateString('es-AR')}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-white/40 text-sm">
                        {p.fecha_vencimiento ? new Date(p.fecha_vencimiento).toLocaleDateString('es-AR') : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color}`}>{cfg.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-white font-semibold text-sm">
                        ${Number(p.total).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/presupuestos/${p.id}`}
                        className="p-1.5 rounded text-white/30 hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors inline-flex">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
