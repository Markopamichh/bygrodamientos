import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';
import NuevoMovimiento from './NuevoMovimiento';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Nuevo movimiento — Admin BYG' };

export default async function NuevoMovimientoPage() {
  const supabase = createAdminClient();
  const { data: proveedores } = await supabase.from('proveedores').select('id, nombre').order('nombre');

  return (
    <div className="p-6 md:p-8 max-w-xl">
      <div className="mb-6">
        <Link
          href="/admin/movimientos"
          className="text-white/30 hover:text-white text-sm transition-colors flex items-center gap-1.5 mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver a movimientos
        </Link>
        <h1 className="text-2xl font-bold text-white">Nuevo movimiento</h1>
        <p className="text-white/40 text-sm mt-0.5">
          Buscá el ítem por código y registrá el ingreso, venta, devolución o ajuste.
        </p>
      </div>

      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
        <NuevoMovimiento
          proveedores={(proveedores ?? []).map((p) => ({ id: p.id as string, nombre: p.nombre as string }))}
        />
      </div>
    </div>
  );
}
