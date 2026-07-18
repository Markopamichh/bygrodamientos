import { createAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { updateItemAction } from '../../actions';
import EditItemForm from './EditItemForm';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase.from('items').select('codigo').eq('id', id).single();
  return { title: data?.codigo ? `Editar ${data.codigo} — Stock Admin BYG` : 'Editar ítem' };
}

export default async function EditarItemPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: raw } = await supabase
    .from('items')
    .select(
      'id, codigo, fabricante, numero_parte, medida_interna, medida_externa, ancho, stock_minimo, precio_costo, precio_venta, ubicacion, activo, producto_id, productos(nombre, subcategoria)'
    )
    .eq('id', id)
    .single();

  if (!raw) notFound();

  // Rubros existentes para el desplegable (paginado: PostgREST corta en 1000).
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

  const productoRel = raw.productos as unknown as
    | { nombre: string; subcategoria: string | null }
    | null;

  const item = {
    id: raw.id as string,
    codigo: raw.codigo as string,
    fabricante: (raw.fabricante as string | null) ?? '',
    numero_parte: (raw.numero_parte as string | null) ?? '',
    medida_interna: raw.medida_interna as number | null,
    medida_externa: raw.medida_externa as number | null,
    ancho: raw.ancho as number | null,
    stock_minimo: raw.stock_minimo as number,
    precio_costo: raw.precio_costo as number | null,
    precio_venta: raw.precio_venta as number | null,
    ubicacion: (raw.ubicacion as string | null) ?? '',
    activo: raw.activo as boolean,
    nombre: productoRel?.nombre ?? '',
    rubro: productoRel?.subcategoria ?? '',
  };

  const updateWithId = updateItemAction.bind(null, id);

  return (
    <div className="p-6 md:p-8 max-w-2xl">
      <div className="mb-6">
        <a
          href={`/admin/stock/${id}`}
          className="text-white/30 hover:text-white text-sm transition-colors flex items-center gap-1.5 mb-4"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Volver a la ficha
        </a>
        <h1 className="text-2xl font-bold text-white">Editar ítem</h1>
        <p className="text-white/40 text-sm mt-0.5 font-mono">{item.codigo}</p>
      </div>
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
        <EditItemForm action={updateWithId} rubros={rubros} item={item} backHref={`/admin/stock/${id}`} />
      </div>
    </div>
  );
}
