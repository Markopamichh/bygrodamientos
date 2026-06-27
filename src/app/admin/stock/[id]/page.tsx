import { createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CodigosEquivalentes from './CodigosEquivalentes';
import RegistrarMovimiento from './RegistrarMovimiento';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase.from('items').select('codigo').eq('id', id).single();
  return { title: data?.codigo ? `${data.codigo} — Stock Admin BYG` : 'Ítem de stock' };
}

export default async function StockItemPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: item }, { data: codigos }, { data: movimientos }] = await Promise.all([
    supabase
      .from('items')
      .select(
        'id, codigo, fabricante, numero_parte, medida_interna, medida_externa, ancho, stock_actual, stock_minimo, precio_costo, precio_venta, ubicacion, activo, created_at, updated_at, producto_id, productos(nombre)'
      )
      .eq('id', id)
      .single(),
    supabase
      .from('item_codigos_equivalentes')
      .select('id, marca, codigo')
      .eq('item_id', id)
      .order('marca'),
    supabase
      .from('movimientos_stock')
      .select('id, tipo, cantidad, stock_resultante, nota, created_at')
      .eq('item_id', id)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  if (!item) notFound();

  const productoNombre =
    (item.productos as unknown as { nombre: string } | null)?.nombre ?? '—';

  const fmt = (n: number | null) =>
    n != null ? `$${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '—';

  const fmtDate = (s: string) =>
    new Date(s).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const isAlerta = item.stock_actual <= item.stock_minimo;

  return (
    <div className="p-6 md:p-8 max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/stock"
          className="text-white/30 hover:text-white text-sm transition-colors flex items-center gap-1.5 mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver al stock
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-white font-mono">{item.codigo}</h1>
              {item.fabricante && (
                <span className="text-sm text-white/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                  {item.fabricante}
                </span>
              )}
              {!item.activo && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/40">
                  Inactivo
                </span>
              )}
            </div>
            <p className="text-white/40 text-sm mt-1">{productoNombre}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/stock/${id}/editar`}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white px-4 py-2.5 rounded-lg text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
              </svg>
              Editar
            </Link>
            <RegistrarMovimiento itemId={id} />
          </div>
        </div>
      </div>

      {/* Stock destacado */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          className={`rounded-xl border p-4 ${
            isAlerta
              ? 'bg-yellow-500/5 border-yellow-500/20'
              : 'bg-[#1a1a1a] border-white/10'
          }`}
        >
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Stock actual</p>
          <p
            className={`text-2xl font-bold ${
              item.stock_actual === 0
                ? 'text-red-400'
                : isAlerta
                ? 'text-yellow-400'
                : 'text-white'
            }`}
          >
            {item.stock_actual}
          </p>
          {isAlerta && item.stock_actual > 0 && (
            <p className="text-xs text-yellow-400/70 mt-1">Bajo mínimo</p>
          )}
        </div>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Stock mínimo</p>
          <p className="text-2xl font-bold text-white">{item.stock_minimo}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Precio costo</p>
          <p className="text-lg font-semibold text-white">{fmt(item.precio_costo)}</p>
        </div>
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Precio venta</p>
          <p className="text-lg font-semibold text-white">{fmt(item.precio_venta)}</p>
        </div>
      </div>

      {/* Datos del ítem */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Datos del ítem</h2>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4">
          <DataField label="Número de parte" value={item.numero_parte} />
          <DataField
            label="Medidas (mm)"
            value={
              item.medida_interna != null || item.medida_externa != null || item.ancho != null
                ? `${item.medida_interna ?? '?'} × ${item.medida_externa ?? '?'} × ${item.ancho ?? '?'}`
                : null
            }
          />
          <DataField label="Ubicación" value={item.ubicacion} />
          <DataField
            label="Creado"
            value={fmtDate(item.created_at)}
          />
          <DataField
            label="Actualizado"
            value={fmtDate(item.updated_at)}
          />
        </dl>
      </div>

      {/* Códigos equivalentes */}
      <CodigosEquivalentes
        itemId={id}
        codigos={(codigos ?? []).map((c) => ({
          id: c.id as string,
          marca: c.marca as string,
          codigo: c.codigo as string,
        }))}
      />

      {/* Historial de movimientos */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">Historial de movimientos</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider">
                  Fecha
                </th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider">
                  Tipo
                </th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider hidden sm:table-cell">
                  Stock resultante
                </th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider hidden md:table-cell">
                  Nota
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {(movimientos ?? []).map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">
                    {fmtDate(m.created_at as string)}
                  </td>
                  <td className="px-4 py-3">
                    <TipoBadge tipo={m.tipo as string} />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-sm font-mono font-medium ${
                        (m.cantidad as number) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {(m.cantidad as number) >= 0 ? '+' : ''}
                      {m.cantidad as number}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-white/60 text-sm font-mono">{m.stock_resultante as number}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-white/40 text-sm">{(m.nota as string | null) ?? '—'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(movimientos ?? []).length === 0 && (
          <div className="py-10 text-center">
            <p className="text-white/30 text-sm">Sin movimientos registrados</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DataField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs text-white/40 mb-0.5">{label}</dt>
      <dd className="text-sm text-white/80">{value ?? '—'}</dd>
    </div>
  );
}

function TipoBadge({ tipo }: { tipo: string }) {
  const map: Record<string, { label: string; className: string }> = {
    ingreso: { label: 'Ingreso', className: 'bg-green-500/15 text-green-400' },
    venta: { label: 'Venta', className: 'bg-red-500/15 text-red-400' },
    devolucion: { label: 'Devolución', className: 'bg-blue-500/15 text-blue-400' },
    ajuste: { label: 'Ajuste', className: 'bg-yellow-500/15 text-yellow-400' },
  };
  const { label, className } = map[tipo] ?? { label: tipo, className: 'bg-white/10 text-white/40' };
  return (
    <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${className}`}>
      {label}
    </span>
  );
}
