import { createAdminClient } from '@/lib/supabase/server';
import { createItemAction } from '../actions';
import ItemForm from './ItemForm';

export const metadata = { title: 'Nuevo ítem — Stock Admin BYG' };

export default async function NuevoItemPage() {
  const supabase = createAdminClient();

  // Rubros existentes (para el desplegable). Se pagina porque PostgREST corta en 1000.
  const rubrosSet = new Set<string>();
  for (let from = 0; from < 8000; from += 1000) {
    const { data } = await supabase
      .from('productos')
      .select('subcategoria')
      .not('subcategoria', 'is', null)
      .range(from, from + 999);
    const rows = data ?? [];
    for (const r of rows) {
      const v = (r.subcategoria as string | null)?.trim();
      if (v) rubrosSet.add(v);
    }
    if (rows.length < 1000) break;
  }
  const rubros = Array.from(rubrosSet).sort((a, b) => a.localeCompare(b, 'es'));

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
        <ItemForm action={createItemAction} rubros={rubros} />
      </div>
    </div>
  );
}
