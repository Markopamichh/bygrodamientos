import { createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import EliminarMovimiento from './EliminarMovimiento';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Movimiento ${id.slice(0, 8)} — Admin BYG` };
}

const TIPO_LABEL: Record<string, { label: string; className: string }> = {
  ingreso: { label: 'Ingreso', className: 'bg-green-500/15 text-green-400' },
  venta: { label: 'Venta', className: 'bg-red-500/15 text-red-400' },
  devolucion: { label: 'Devolución', className: 'bg-blue-500/15 text-blue-400' },
  ajuste: { label: 'Ajuste', className: 'bg-yellow-500/15 text-yellow-400' },
};

export default async function MovimientoDetallePage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: m } = await supabase
    .from('movimientos_stock')
    .select(
      'id, tipo, cantidad, stock_resultante, nota, factura, precio_unitario, cliente_nombre, created_at, item_id, items(codigo, productos(nombre)), proveedores(nombre)'
    )
    .eq('id', id)
    .single();

  if (!m) notFound();

  const tipo = TIPO_LABEL[m.tipo as string] ?? { label: m.tipo as string, className: 'bg-white/10 text-white/40' };
  const item = m.items as unknown as { codigo: string; productos: { nombre: string } | null } | null;
  const proveedor = (m.proveedores as unknown as { nombre: string } | null)?.nombre ?? null;
  const cantidad = m.cantidad as number;

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

  const totalOperacion =
    m.precio_unitario != null ? Number(m.precio_unitario) * Math.abs(cantidad) : null;

  return (
    <div className="p-6 md:p-8 max-w-2xl space-y-6">
      <div>
        <Link
          href="/admin/movimientos"
          className="text-white/30 hover:text-white text-sm transition-colors flex items-center gap-1.5 mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver a movimientos
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className={`inline-flex text-sm px-3 py-1 rounded-full font-medium ${tipo.className}`}>
              {tipo.label}
            </span>
            <h1 className="text-2xl font-bold font-mono text-white">
              <span className={cantidad >= 0 ? 'text-green-400' : 'text-red-400'}>
                {cantidad >= 0 ? '+' : ''}
                {cantidad}
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/movimientos/${id}/editar`}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white px-4 py-2.5 rounded-lg text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
              </svg>
              Editar
            </Link>
            <EliminarMovimiento id={id} />
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
          <Field label="Fecha y hora" value={fmtDate(m.created_at as string)} />
          <Field
            label="Ítem"
            value={
              <Link href={`/admin/stock/${m.item_id}`} className="text-yellow-400 hover:text-yellow-300 font-mono">
                {item?.codigo ?? '—'}
              </Link>
            }
          />
          <Field label="Producto" value={item?.productos?.nombre ?? '—'} full />
          <Field label="Proveedor" value={proveedor ?? '—'} />
          <Field label="Cliente" value={(m.cliente_nombre as string | null) ?? '—'} />
          <Field label="Factura" value={(m.factura as string | null) ?? '—'} />
          <Field label="Precio unitario" value={fmt(m.precio_unitario as number | null)} />
          <Field label="Total operación" value={totalOperacion != null ? fmt(totalOperacion) : '—'} />
          <Field label="Stock resultante" value={String(m.stock_resultante as number)} />
          <Field label="Nota" value={(m.nota as string | null) ?? '—'} full />
        </dl>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  full = false,
}: {
  label: string;
  value: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <dt className="text-xs text-white/40 uppercase tracking-wider mb-1">{label}</dt>
      <dd className="text-sm text-white/80">{value}</dd>
    </div>
  );
}
