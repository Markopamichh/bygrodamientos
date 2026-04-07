import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard — Admin BYG' };

async function getStats() {
  const supabase = await createClient();

  const [
    { count: totalProductos },
    { count: productosActivos },
    { count: stockCritico },
    { count: totalCategorias },
  ] = await Promise.all([
    supabase.from('productos').select('*', { count: 'exact', head: true }),
    supabase.from('productos').select('*', { count: 'exact', head: true }).eq('activo', true),
    supabase
      .from('productos')
      .select('*', { count: 'exact', head: true })
      .lte('stock', 2)
      .eq('activo', true),
    supabase.from('categorias').select('*', { count: 'exact', head: true }),
  ]);

  return {
    totalProductos: totalProductos ?? 0,
    productosActivos: productosActivos ?? 0,
    stockCritico: stockCritico ?? 0,
    totalCategorias: totalCategorias ?? 0,
  };
}

async function getRecentProducts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('productos')
    .select('id, nombre, stock, activo, updated_at')
    .order('updated_at', { ascending: false })
    .limit(5);
  return data ?? [];
}

export default async function DashboardPage() {
  const [stats, recent] = await Promise.all([getStats(), getRecentProducts()]);

  const statCards = [
    {
      label: 'Total Productos',
      value: stats.totalProductos,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: 'Productos Activos',
      value: stats.productosActivos,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-green-400',
      bg: 'bg-green-400/10',
    },
    {
      label: 'Stock Crítico (≤2)',
      value: stats.stockCritico,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
      color: stats.stockCritico > 0 ? 'text-red-400' : 'text-white/40',
      bg: stats.stockCritico > 0 ? 'bg-red-400/10' : 'bg-white/5',
    },
    {
      label: 'Categorías',
      value: stats.totalCategorias,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
        </svg>
      ),
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Resumen general del catálogo</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-5">
            <div className={`inline-flex p-2 rounded-lg ${card.bg} ${card.color} mb-3`}>
              {card.icon}
            </div>
            <p className="text-3xl font-bold text-white">{card.value}</p>
            <p className="text-white/40 text-sm mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Recent products */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-white font-semibold">Últimos cambios</h2>
          <a href="/admin/productos" className="text-yellow-400 hover:text-yellow-300 text-sm transition-colors">
            Ver todos →
          </a>
        </div>
        <div className="divide-y divide-white/5">
          {recent.map((p) => (
            <div key={p.id} className="px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${p.activo ? 'bg-green-400' : 'bg-white/20'}`}
                />
                <span className="text-white/80 text-sm truncate max-w-xs">{p.nombre}</span>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <StockBadge stock={p.stock} />
                <a
                  href={`/admin/productos/${p.id}/editar`}
                  className="text-white/30 hover:text-yellow-400 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                  </svg>
                </a>
              </div>
            </div>
          ))}
          {recent.length === 0 && (
            <p className="px-5 py-8 text-center text-white/30 text-sm">
              No hay productos aún. <a href="/admin/productos/nuevo" className="text-yellow-400 hover:underline">Crear el primero →</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">Sin stock</span>;
  if (stock <= 5) return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">{stock} u.</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">{stock} u.</span>;
}
