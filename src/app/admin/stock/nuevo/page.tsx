import { createAdminClient } from '@/lib/supabase/server';
import { createItemAction } from '../actions';
import ItemForm from './ItemForm';

export const metadata = { title: 'Nuevo ítem — Stock Admin BYG' };

export default async function NuevoItemPage() {
  const supabase = createAdminClient();
  const { data: productosRaw } = await supabase
    .from('productos')
    .select('id, nombre')
    .eq('activo', true)
    .order('nombre');

  const productos = (productosRaw ?? []).map((p) => ({
    id: p.id as string,
    nombre: p.nombre as string,
  }));

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="mb-6">
        <a
          href="/admin/stock"
          className="text-white/30 hover:text-white text-sm transition-colors flex items-center gap-1.5 mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver al stock
        </a>
        <h1 className="text-2xl font-bold text-white">Nuevo ítem de stock</h1>
        <p className="text-white/40 text-sm mt-0.5">
          Completá los datos del SKU. Si cargás stock inicial se registra automáticamente
          como movimiento de ingreso.
        </p>
      </div>
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
        <ItemForm action={createItemAction} productos={productos} />
      </div>
    </div>
  );
}
