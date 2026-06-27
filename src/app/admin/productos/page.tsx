import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';
import Image from 'next/image';
import ProductToggle from './ProductToggle';
import DeleteButton from './DeleteButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Productos — Admin BYG' };

interface SearchParams {
  q?: string;
  tab?: string;
  categoria?: string;
}

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q, tab = 'stock', categoria } = await searchParams;
  const supabase = createAdminClient();

  const [{ data: stockRaw }, { data: encargoRaw }, { data: categoriasRaw }] = await Promise.all([
    supabase
      .from('productos')
      .select('id, nombre, stock, precio, imagen_url, activo, categoria_nombre, subcategoria')
      .eq('tipo_disponibilidad', 'stock')
      .order('categoria_nombre')
      .order('nombre'),
    supabase
      .from('productos')
      .select('id, nombre, imagen_url, activo, categoria_nombre, categoria_slug, subcategoria')
      .eq('tipo_disponibilidad', 'encargo')
      .order('categoria_nombre')
      .order('nombre'),
    supabase.from('categorias').select('id, nombre').order('nombre'),
  ]);

  // Filtrar por búsqueda
  const filtrar = <T extends { nombre: string; categoria_nombre?: string | null }>(arr: T[]) => {
    if (!q) return arr;
    const ql = q.toLowerCase();
    return arr.filter(
      (p) => p.nombre.toLowerCase().includes(ql) || (p.categoria_nombre ?? '').toLowerCase().includes(ql)
    );
  };

  const productosStock = filtrar(stockRaw ?? []);
  const productosEncargo = filtrar(encargoRaw ?? []).filter(
    (p) => !categoria || p.categoria_nombre === categoria
  );

  // Agrupar encargo por categoría
  const encargoAgrupado: Record<string, typeof productosEncargo> = {};
  for (const p of productosEncargo) {
    const cat = p.categoria_nombre ?? 'Sin categoría';
    if (!encargoAgrupado[cat]) encargoAgrupado[cat] = [];
    encargoAgrupado[cat].push(p);
  }

  const categorias = (categoriasRaw ?? []).map((c) => ({ id: c.id as string, nombre: c.nombre as string }));

  return (
    <div className="p-6 md:p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Productos</h1>
          <p className="text-white/40 text-sm mt-0.5">
            {(stockRaw ?? []).length} en stock · {(encargoRaw ?? []).length} por encargo
          </p>
        </div>
        {tab !== 'encargo' && (
          <div className="flex items-center gap-2">
            <Link href="/admin/productos/importar" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white px-4 py-2.5 rounded-lg text-sm transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Importar CSV
            </Link>
            <Link href="/admin/productos/nuevo" className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Nuevo producto
            </Link>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 w-fit">
        <Link
          href={`/admin/productos?tab=stock${q ? `&q=${q}` : ''}`}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            tab !== 'encargo'
              ? 'bg-white text-black shadow'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            Stock propio
            <span className="bg-white/10 text-white/60 text-xs px-1.5 py-0.5 rounded-full">
              {(stockRaw ?? []).length}
            </span>
          </span>
        </Link>
        <Link
          href={`/admin/productos?tab=encargo${q ? `&q=${q}` : ''}`}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'encargo'
              ? 'bg-white text-black shadow'
              : 'text-white/50 hover:text-white'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
            Catálogo MR — Por encargo
            <span className="bg-white/10 text-white/60 text-xs px-1.5 py-0.5 rounded-full">
              {(encargoRaw ?? []).length}
            </span>
          </span>
        </Link>
      </div>

      {/* Búsqueda */}
      <form method="GET" className="flex flex-wrap gap-3 mb-6">
        <input type="hidden" name="tab" value={tab} />
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre o categoría..."
          className="flex-1 min-w-48 bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-yellow-500/50"
        />
        {tab === 'encargo' && (
          <select
            name="categoria"
            defaultValue={categoria}
            className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2.5 text-white/80 text-sm focus:outline-none focus:border-yellow-500/50"
          >
            <option value="">Todas las categorías</option>
            {Object.keys(encargoAgrupado).sort().map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        )}
        <button type="submit" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 px-4 py-2.5 rounded-lg text-sm transition-colors">
          Buscar
        </button>
        {(q || categoria) && (
          <a href={`/admin/productos?tab=${tab}`} className="bg-white/5 border border-white/10 text-white/40 px-4 py-2.5 rounded-lg text-sm transition-colors hover:text-white">
            Limpiar
          </a>
        )}
      </form>

      {/* ── TAB STOCK ── */}
      {tab !== 'encargo' && (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider">Producto</th>
                  <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider hidden md:table-cell">Categoría</th>
                  <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider">Stock</th>
                  <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider hidden sm:table-cell">Precio</th>
                  <th className="text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {productosStock.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#222] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                          {p.imagen_url ? (
                            <Image src={p.imagen_url} alt={p.nombre} width={40} height={40} className="object-contain w-full h-full" />
                          ) : (
                            <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className="text-white/80 text-sm line-clamp-1 max-w-xs">{p.nombre}</p>
                          {p.subcategoria && <p className="text-white/30 text-xs">{p.subcategoria}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-white/40 text-sm">{p.categoria_nombre ?? '—'}</span>
                    </td>
                    <td className="px-4 py-3"><StockBadge stock={p.stock} /></td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-white/60 text-sm">
                        {p.precio != null ? `$${Number(p.precio).toLocaleString('es-AR')}` : '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3"><ProductToggle id={p.id} activo={p.activo} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/productos/${p.id}/editar`} className="p-1.5 rounded text-white/30 hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                          </svg>
                        </Link>
                        <DeleteButton id={p.id} nombre={p.nombre} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {productosStock.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-white/30 text-sm mb-4">No se encontraron productos</p>
              <Link href="/admin/productos/nuevo" className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors">Crear el primero →</Link>
            </div>
          )}
        </div>
      )}

      {/* ── TAB ENCARGO ── */}
      {tab === 'encargo' && (
        <div className="space-y-4">
          {Object.keys(encargoAgrupado).length === 0 && (
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl py-16 text-center">
              <p className="text-white/30 text-sm">No se encontraron productos</p>
            </div>
          )}

          {Object.entries(encargoAgrupado)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([cat, prods]) => (
              <div key={cat} className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
                {/* Cabecera de categoría */}
                <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <h2 className="text-white font-semibold text-sm">{cat}</h2>
                  </div>
                  <span className="text-white/30 text-xs">{prods.length} producto{prods.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Productos de esta categoría */}
                <div className="divide-y divide-white/5">
                  {prods.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors">
                      {/* Miniatura */}
                      <div className="w-9 h-9 rounded-lg bg-[#222] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                        {p.imagen_url ? (
                          <Image src={p.imagen_url} alt={p.nombre} width={36} height={36} className="object-contain w-full h-full" />
                        ) : (
                          <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                          </svg>
                        )}
                      </div>

                      {/* Nombre */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white/80 text-sm truncate">{p.nombre}</p>
                        {p.subcategoria && p.subcategoria !== cat && (
                          <p className="text-white/30 text-xs truncate">{p.subcategoria}</p>
                        )}
                      </div>

                      {/* Badge encargo */}
                      <span className="text-xs bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full shrink-0 hidden sm:inline">
                        Por encargo
                      </span>

                      {/* Toggle activo/inactivo */}
                      <ProductToggle id={p.id} activo={p.activo} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-red-400" />0</span>;
  if (stock <= 5) return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />{stock}</span>;
  return <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-400 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />{stock}</span>;
}
