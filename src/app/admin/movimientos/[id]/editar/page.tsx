import { createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { editarMovimientoAction } from '@/app/admin/stock/actions';
import EditarMovimientoForm from './EditarMovimientoForm';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Editar movimiento — Admin BYG' };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditarMovimientoPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: m }, { data: proveedores }] = await Promise.all([
    supabase
      .from('movimientos_stock')
      .select('id, tipo, proveedor_id, cliente_nombre, factura, precio_unitario, nota, items(codigo)')
      .eq('id', id)
      .single(),
    supabase.from('proveedores').select('id, nombre').order('nombre'),
  ]);

  if (!m) notFound();

  const item = m.items as unknown as { codigo: string } | null;
  const updateWithId = editarMovimientoAction.bind(null, id);

  return (
    <div className="p-6 md:p-8 max-w-xl">
      <div className="mb-6">
        <Link
          href={`/admin/movimientos/${id}`}
          className="text-white/30 hover:text-white text-sm transition-colors flex items-center gap-1.5 mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver
        </Link>
        <h1 className="text-2xl font-bold text-white">Editar movimiento</h1>
        <p className="text-white/40 text-sm mt-0.5">
          Ítem {item?.codigo ?? ''} · {m.tipo as string}. La cantidad y el tipo no se editan; para
          corregirlos, eliminá el movimiento y registralo de nuevo.
        </p>
      </div>

      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
        <EditarMovimientoForm
          action={updateWithId}
          tipo={m.tipo as string}
          proveedores={(proveedores ?? []).map((p) => ({ id: p.id as string, nombre: p.nombre as string }))}
          initial={{
            proveedor_id: (m.proveedor_id as string | null) ?? '',
            cliente_nombre: (m.cliente_nombre as string | null) ?? '',
            factura: (m.factura as string | null) ?? '',
            precio_unitario: m.precio_unitario != null ? String(m.precio_unitario) : '',
            nota: (m.nota as string | null) ?? '',
          }}
        />
      </div>
    </div>
  );
}
