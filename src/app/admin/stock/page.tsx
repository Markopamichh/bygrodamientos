import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { ImportStockButton } from './ImportStockButton';

export const metadata = { title: 'Stock — Admin BYG' };

interface SearchParams {
  q?: string;
  rubro?: string;
}

/** Valor de ?rubro= para los ítems cuyo producto no tiene rubro cargado. */
const SIN_RUBRO = '__sin_rubro__';

interface ItemRow {
  id: string;
  codigo: string;
  fabricante: string | null;
  stock_actual: number;
  stock_minimo: number;
  precio_venta: number | null;
  ubicacion: string | null;
  activo: boolean;
  productos: { nombre: string; subcategoria: string | null } | null;
}

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, rubro } = await searchParams;
  const supabase = createAdminClient();
  const sel = 'id, codigo, fabricante, stock_actual, stock_minimo, precio_venta, ubicacion, activo, productos(nombre, subcategoria)';
  const selInner = 'id, codigo, fabricante, stock_actual, stock_minimo, precio_venta, ubicacion, activo, productos!inner(nombre, subcategoria)';

  // PostgREST corta en 1000 filas por página → paginamos para traer todo (tope de seguridad).
  const PAGE = 1000;
  const MAX = 6000;
  async function fetchAll(build: (from: number, to: number) => PromiseLike<{ data: unknown[] | null }>): Promise<ItemRow[]> {
    const out: ItemRow[] = [];
    for (let from = 0; from < MAX; from += PAGE) {
      const { data } = await build(from, from + PAGE - 1);
      const rows = (data ?? []) as unknown as ItemRow[];
      out.push(...rows);
      if (rows.length < PAGE) break;
    }
    return out;
  }

  let items: ItemRow[] = [];
  let rubros: { nombre: string; valor: string; total: number }[] = [];

  // Vista por defecto (sin búsqueda ni rubro): listado de rubros con su cantidad.
  if (!q && !rubro) {
    const conteo = new Map<string, number>();
    for (let from = 0; from < MAX; from += PAGE) {
      const { data } = await supabase
        .from('items')
        .select('id, productos!inner(subcategoria)')
        .range(from, from + PAGE - 1);
      const rows = (data ?? []) as unknown as { productos: { subcategoria: string | null } | null }[];
      for (const r of rows) {
        const key = r.productos?.subcategoria?.trim() || SIN_RUBRO;
        conteo.set(key, (conteo.get(key) ?? 0) + 1);
      }
      if (rows.length < PAGE) break;
    }
    rubros = Array.from(conteo.entries())
      .map(([valor, total]) => ({
        valor,
        nombre: valor === SIN_RUBRO ? 'Sin rubro' : valor,
        total,
      }))
      .sort((a, b) => {
        if (a.valor === SIN_RUBRO) return 1;
        if (b.valor === SIN_RUBRO) return -1;
        return b.total - a.total;
      });
  } else if (rubro) {
    // Ítems de un rubro puntual
    items = await fetchAll((from, to) => {
      const base = supabase.from('items').select(selInner).order('codigo').range(from, to);
      return rubro === SIN_RUBRO
        ? base.filter('productos.subcategoria', 'is', null)
        : base.filter('productos.subcategoria', 'eq', rubro);
    });
  } else if (q) {
    const [byCode, byProducto, { data: equivMatches }] = await Promise.all([
      // por código del ítem
      fetchAll((from, to) => supabase.from('items').select(sel).ilike('codigo', `%${q}%`).order('codigo').range(from, to)),
      // por rubro (subcategoria) o nombre del producto
      fetchAll((from, to) =>
        supabase
          .from('items')
          .select(selInner)
          .or(`nombre.ilike.%${q}%,subcategoria.ilike.%${q}%`, { foreignTable: 'productos' })
          .order('codigo')
          .range(from, to)
      ),
      // por códigos equivalentes
      supabase.from('item_codigos_equivalentes').select('item_id').ilike('codigo', `%${q}%`),
    ]);

    const merged = new Map<string, ItemRow>();
    for (const row of [...byCode, ...byProducto]) merged.set(row.id, row);

    const extraIds = Array.from(
      new Set((equivMatches ?? []).map((e) => e.item_id as string))
    ).filter((id) => !merged.has(id));
    if (extraIds.length > 0) {
      const { data } = await supabase.from('items').select(sel).in('id', extraIds).order('codigo');
      for (const row of (data ?? []) as unknown as ItemRow[]) merged.set(row.id, row);
    }

    items = Array.from(merged.values());
  }

  const enListado = Boolean(q || rubro);
  const tituloRubro = rubro === SIN_RUBRO ? 'Sin rubro' : rubro;

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          {enListado && (
            <Link
              href="/admin/stock"
              className="text-white/30 hover:text-white text-sm transition-colors inline-flex items-center gap-1.5 mb-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Volver a rubros
            </Link>
          )}
          <h1 className="text-2xl font-bold text-white">{tituloRubro ?? 'Stock'}</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {enListado
              ? `${items.length} ítem${items.length !== 1 ? 's' : ''}`
              : `${rubros.length} rubros · ${rubros.reduce((a, r) => a + r.total, 0)} ítems`}
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
            Exportar Excel
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
          placeholder="Buscar por código, rubro o nombre (ej: RETENES, 6407)..."
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

      {!enListado ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {rubros.map((r) => (
            <Link
              key={r.valor}
              href={`/admin/stock?rubro=${encodeURIComponent(r.valor)}`}
              className="bg-[#1a1a1a] border border-white/10 hover:border-yellow-500/50 hover:bg-white/[0.03] rounded-xl p-4 transition-colors group"
            >
              <p className="text-white/80 group-hover:text-white text-sm font-medium leading-snug mb-2">
                {r.nombre}
              </p>
              <p className="text-yellow-400 text-xl font-bold">{r.total}</p>
              <p className="text-white/30 text-xs">ítem{r.total !== 1 ? 's' : ''}</p>
            </Link>
          ))}
        </div>
      ) : (
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
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider hidden sm:table-cell">
                  Rubro
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
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {item.productos?.subcategoria ? (
                      <span className="text-xs text-white/70 bg-white/5 px-2 py-1 rounded-lg">
                        {item.productos.subcategoria}
                      </span>
                    ) : (
                      <span className="text-white/20 text-sm">—</span>
                    )}
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
              {q ? `Sin resultados para "${q}"` : 'No hay ítems en este rubro'}
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
      )}
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
