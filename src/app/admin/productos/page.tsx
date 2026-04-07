import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import ProductToggle from './ProductToggle';
import DeleteButton from './DeleteButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Productos — Admin BYG' };

interface SearchParams {
  q?: string;
  categoria?: string;
}

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, categoria } = await searchParams;
  const supabase = await createClient();

  // Build query
  let query = supabase
    .from('productos')
    .select('id, nombre, slug, stock, precio, imagen_url, activo, categorias(id, nombre, slug)')
    .order('nombre', { ascending: true });

  if (categoria) query = query.eq('categoria_id', categoria);
  if (q) query = query.ilike('nombre', `%${q}%`);

  const [{ data: productos }, { data: categorias }] = await Promise.all([
    query,
    supabase.from('categorias').select('id, nombre').order('nombre'),
  ]);

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Productos</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {productos?.length ?? 0} resultado{(productos?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo producto
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre..."
          className="flex-1 min-w-48 bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-yellow-500/50"
        />
        <select
          name="categoria"
          defaultValue={categoria}
          className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2.5 text-white/80 text-sm focus:outline-none focus:border-yellow-500/50"
        >
          <option value="">Todas las categorías</option>
          {categorias?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          Filtrar
        </button>
        {(q || categoria) && (
          <a
            href="/admin/productos"
            className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 px-4 py-2.5 rounded-lg text-sm transition-colors"
          >
            Limpiar
          </a>
        )}
      </form>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider">
                  Producto
                </th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider hidden md:table-cell">
                  Categoría
                </th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider">
                  Stock
                </th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider hidden sm:table-cell">
                  Precio
                </th>
                <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {productos?.map((p) => {
                const cat = p.categorias as { nombre: string } | null;
                return (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Image + name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#222] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                          {p.imagen_url ? (
                            <Image
                              src={p.imagen_url}
                              alt={p.nombre}
                              width={40}
                              height={40}
                              className="object-contain w-full h-full"
                            />
                          ) : (
                            <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                          )}
                        </div>
                        <span className="text-white/80 text-sm line-clamp-2 max-w-xs">{p.nombre}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-white/40 text-sm">{cat?.nombre ?? '—'}</span>
                    </td>

                    {/* Stock */}
                    <td className="px-4 py-3">
                      <StockBadge stock={p.stock} />
                    </td>

                    {/* Price */}
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-white/60 text-sm">
                        {p.precio != null ? `$${p.precio.toLocaleString('es-AR')}` : '—'}
                      </span>
                    </td>

                    {/* Toggle */}
                    <td className="px-4 py-3">
                      <ProductToggle id={p.id} activo={p.activo} />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/productos/${p.id}/editar`}
                          className="p-1.5 rounded text-white/30 hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors"
                          title="Editar producto"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                          </svg>
                        </Link>
                        <DeleteButton id={p.id} nombre={p.nombre} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {(!productos || productos.length === 0) && (
          <div className="py-16 text-center">
            <p className="text-white/30 text-sm mb-4">No se encontraron productos</p>
            <Link
              href="/admin/productos/nuevo"
              className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors"
            >
              Crear el primero →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />0
      </span>
    );
  if (stock <= 5)
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
        {stock}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
      {stock}
    </span>
  );
}
