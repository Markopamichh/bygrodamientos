import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ImportStockButton } from './ImportStockButton';

export const metadata = { title: 'Stock — Admin BYG' };

interface SearchParams {
  q?: string;
}

interface ItemRow {
  id: string;
  codigo: string;
  fabricante: string | null;
  stock_actual: number;
  stock_minimo: number;
  precio_venta: number | null;
  ubicacion: string | null;
  activo: boolean;
  productos: { nombre: string } | null;
}

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q } = await searchParams;
  const supabase = createAdminClient();
  const sel = 'id, codigo, fabricante, stock_actual, stock_minimo, precio_venta, ubicacion, activo, productos(nombre)';

  let items: ItemRow[] = [];

  if (q) {
    const [{ data: byCode }, { data: equivMatches }] = await Promise.all([
      supabase.from('items').select(sel).ilike('codigo', `%${q}%`).order('codigo'),
      supabase.from('item_codigos_equivalentes').select('item_id').ilike('codigo', `%${q}%`),
    ]);

    const foundIds = new Set((byCode ?? []).map((i) => i.id as string));
    const extraIds = Array.from(
      new Set((equivMatches ?? []).map((e) => e.item_id as string))
    ).filter((id) => !foundIds.has(id));

    let byEquiv: ItemRow[] = [];
    if (extraIds.length > 0) {
      const { data } = await supabase
        .from('items')
        .select(sel)
        .in('id', extraIds)
        .order('codigo');
      byEquiv = (data ?? []) as unknown as ItemRow[];
    }

    items = [...((byCode ?? []) as unknown as ItemRow[]), ...byEquiv];
  } else {
    const { data } = await supabase.from('items').select(sel).order('codigo');
    items = (data ?? []) as unknown as ItemRow[];
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Stock</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {items.length} ítem{items.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="/api/admin/stock/export"
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            Exportar CSV
          </a>
          <ImportStockButton />
          <Link
            href="/admin/stock/nuevo"
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo ítem
          </Link>
        </div>
      </div>

      <form method="GET" className="flex gap-3 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por código (incluye códigos equivalentes)..."
          className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-yellow-500/50"
        />
        <button
          type="submit"
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          Buscar
        </button>
        {q && (
          <a
            href="/admin/stock"
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            Limpiar
          </a>
        )}
      </form>

      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider">
                  Código
                </th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider hidden md:table-cell">
                  Producto (familia)
                </th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider hidden lg:table-cell">
                  Fabricante
                </th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider">
                  Stock
                </th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider hidden sm:table-cell">
                  Precio venta
                </th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider hidden sm:table-cell">
                  Ubicación
                </th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-white/90 text-sm font-mono font-medium">
                      {item.codigo}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-white/40 text-sm">
                      {item.productos?.nombre ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-white/40 text-sm">{item.fabricante ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <StockBadge stock={item.stock_actual} minimo={item.stock_minimo} />
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-white/60 text-sm">
                      {item.precio_venta != null
                        ? `$${Number(item.precio_venta).toLocaleString('es-AR')}`
                        : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {item.ubicacion ? (
                      <span className="text-yellow-400 font-mono text-xs font-bold bg-yellow-500/10 px-2 py-1 rounded-lg">
                        {item.ubicacion}
                      </span>
                    ) : (
                      <Link
                        href={`/admin/stock/${item.id}/editar`}
                        className="text-white/20 text-xs hover:text-yellow-400 transition-colors"
                        title="Asignar ubicación"
                      >
                        + Asignar
                      </Link>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/stock/${item.id}`}
                      className="p-1.5 rounded text-white/30 hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors inline-flex"
                      title="Ver detalle"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-white/30 text-sm mb-4">
              {q ? `Sin resultados para "${q}"` : 'No hay ítems de stock cargados'}
            </p>
            {!q && (
              <Link
                href="/admin/stock/nuevo"
                className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors"
              >
                Crear el primero →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StockBadge({ stock, minimo }: { stock: number; minimo: number }) {
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />0
      </span>
    );
  if (stock <= minimo)
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
        {stock} ↓mín
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
      {stock}
    </span>
  );
}
