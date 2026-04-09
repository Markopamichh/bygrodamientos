import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import CategoryChart from './CategoryChart';
import ExportButton from './ExportButton';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard — Admin BYG' };

// ─────────────────────────────────────────────
// Mock activity feed — TODO: conectar a tabla activity_log en Supabase
// Crear tabla: CREATE TABLE activity_log (id uuid, action text, product_name text, detail text, created_at timestamptz)
// ─────────────────────────────────────────────
const mockActivity = [
  { type: 'edit' as const,   product: 'Rodamiento Rígido 6205',    detail: 'Stock actualizado de 8 → 15',     msAgo: 2 * 3600000 },
  { type: 'create' as const, product: 'Retén NBR 40×60×10',        detail: 'Producto creado',                  msAgo: 5 * 3600000 },
  { type: 'edit' as const,   product: 'Rodamiento Angular 7205',   detail: 'Precio actualizado a $4.500',      msAgo: 1 * 86400000 },
  { type: 'delete' as const, product: 'Correa V A-42 (duplicado)', detail: 'Producto eliminado',               msAgo: 2 * 86400000 },
  { type: 'edit' as const,   product: 'Acople Flexible B-100',     detail: 'Marcado como inactivo',            msAgo: 3 * 86400000 },
];

function timeAgo(msAgo: number) {
  const m = Math.floor(msAgo / 60000);
  const h = Math.floor(msAgo / 3600000);
  const d = Math.floor(msAgo / 86400000);
  if (m < 60) return `hace ${m}m`;
  if (h < 24) return `hace ${h}h`;
  if (d === 1) return 'ayer';
  return `hace ${d} días`;
}

function ActivityIcon({ type }: { type: 'edit' | 'create' | 'delete' }) {
  if (type === 'create') return (
    <span className="w-7 h-7 rounded-full bg-green-500/15 flex items-center justify-center shrink-0">
      <svg className="w-3.5 h-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </span>
  );
  if (type === 'delete') return (
    <span className="w-7 h-7 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
      <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
      </svg>
    </span>
  );
  return (
    <span className="w-7 h-7 rounded-full bg-yellow-500/15 flex items-center justify-center shrink-0">
      <svg className="w-3.5 h-3.5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
      </svg>
    </span>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const [
    totalResult,
    activosResult,
    stockCeroResult,
    stockCriticoResult,
    categoriasResult,
    sinImagenResult,
    productosCatResult,
    recentResult,
    lastUpdateResult,
    userResult,
  ] = await Promise.all([
    supabase.from('productos').select('*', { count: 'exact', head: true }),
    supabase.from('productos').select('*', { count: 'exact', head: true }).eq('activo', true),
    supabase.from('productos').select('*', { count: 'exact', head: true }).eq('stock', 0),
    supabase.from('productos').select('*', { count: 'exact', head: true }).lte('stock', 2),
    supabase.from('categorias').select('*', { count: 'exact', head: true }),
    supabase.from('productos').select('*', { count: 'exact', head: true }).is('imagen_url', null),
    supabase.from('productos').select('categoria_id, categorias(nombre)'),
    supabase.from('productos').select('id, nombre, stock, activo, updated_at').order('updated_at', { ascending: false }).limit(5),
    supabase.from('productos').select('updated_at').order('updated_at', { ascending: false }).limit(1).single(),
    supabase.auth.getUser(),
  ]);

  const totalProductos  = totalResult.count ?? 0;
  const productosActivos = activosResult.count ?? 0;
  const stockCero       = stockCeroResult.count ?? 0;
  const stockCritico    = stockCriticoResult.count ?? 0;
  const stockBajo       = stockCritico - stockCero; // stock 1–2 (no cero)
  const totalCategorias = categoriasResult.count ?? 0;
  const sinImagen       = sinImagenResult.count ?? 0;
  const recent          = recentResult.data ?? [];
  const lastUpdate      = lastUpdateResult.data?.updated_at ?? null;
  const userEmail       = userResult.data.user?.email ?? 'administrador';

  // Agrupar productos por categoría para el gráfico
  const categoryMap: Record<string, number> = {};
  productosCatResult.data?.forEach(p => {
    const cat = p.categorias as unknown as { nombre: string } | null;
    const name = cat?.nombre ?? 'Sin categoría';
    categoryMap[name] = (categoryMap[name] ?? 0) + 1;
  });
  const chartData = Object.entries(categoryMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const kpis = [
    {
      label: 'Total Productos',
      value: totalProductos,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
      color: 'text-blue-400', bg: 'bg-blue-400/10',
      href: '/admin/productos',
      sub: `${productosActivos} activos`,
    },
    {
      label: 'Productos Activos',
      value: productosActivos,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'text-green-400', bg: 'bg-green-400/10',
      href: '/admin/productos',
      sub: totalProductos > 0 ? `${Math.round((productosActivos / totalProductos) * 100)}% del catálogo` : '—',
    },
    {
      label: 'Stock Crítico (≤2)',
      value: stockCritico,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
      color: stockCritico > 0 ? 'text-red-400' : 'text-white/30',
      bg: stockCritico > 0 ? 'bg-red-400/10' : 'bg-white/5',
      href: '/admin/productos',
      sub: stockCero > 0 ? `${stockCero} sin stock` : 'Sin productos en 0',
    },
    {
      label: 'Categorías',
      value: totalCategorias,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
        </svg>
      ),
      color: 'text-yellow-400', bg: 'bg-yellow-400/10',
      href: '/admin/categorias',
      sub: 'Ver todas',
    },
    {
      label: 'Sin Imagen',
      value: sinImagen,
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
        </svg>
      ),
      color: sinImagen > 0 ? 'text-orange-400' : 'text-white/30',
      bg: sinImagen > 0 ? 'bg-orange-400/10' : 'bg-white/5',
      href: '/admin/productos?filter=sin-imagen',
      sub: sinImagen > 0 ? 'Necesitan imagen' : 'Todo OK',
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-white/40 text-sm mt-0.5">Resumen general del catálogo</p>
      </div>

      {/* ── Alertas inteligentes ── */}
      {(stockCero > 0 || stockBajo > 0) && (
        <div className="space-y-2">
          {stockCero > 0 && (
            <div className="flex items-center justify-between gap-3 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-red-400 text-sm font-medium">
                  <span className="font-bold">{stockCero}</span> {stockCero === 1 ? 'producto sin stock' : 'productos sin stock'}
                </p>
              </div>
              <Link href="/admin/productos?filter=sin-stock" className="text-xs text-red-400 hover:text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg transition-colors shrink-0">
                Ver productos →
              </Link>
            </div>
          )}
          {stockBajo > 0 && (
            <div className="flex items-center justify-between gap-3 bg-yellow-500/10 border border-yellow-500/25 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-yellow-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-yellow-400 text-sm font-medium">
                  <span className="font-bold">{stockBajo}</span> {stockBajo === 1 ? 'producto con stock crítico' : 'productos con stock crítico'} (1–2 unidades)
                </p>
              </div>
              <Link href="/admin/productos?filter=stock-critico" className="text-xs text-yellow-400 hover:text-yellow-300 border border-yellow-500/30 px-3 py-1.5 rounded-lg transition-colors shrink-0">
                Ver productos →
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-semibold text-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Agregar producto
        </Link>
        <Link
          href="/admin/productos?filter=sin-imagen"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-sm transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          Sin imagen {sinImagen > 0 && <span className="bg-orange-500/20 text-orange-400 text-xs px-1.5 py-0.5 rounded-full">{sinImagen}</span>}
        </Link>
        <ExportButton />
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {kpis.map((kpi) => (
          <Link
            key={kpi.label}
            href={kpi.href}
            className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors group"
          >
            <div className={`inline-flex p-2 rounded-lg ${kpi.bg} ${kpi.color} mb-3`}>
              {kpi.icon}
            </div>
            <p className="text-2xl font-bold text-white">{kpi.value}</p>
            <p className="text-white/40 text-xs mt-0.5">{kpi.label}</p>
            {kpi.sub && (
              <p className={`text-xs mt-1.5 ${kpi.color} opacity-70`}>{kpi.sub}</p>
            )}
          </Link>
        ))}
      </div>

      {/* ── Chart + Activity Feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Distribución por categoría */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <h2 className="text-white font-semibold text-sm">Productos por categoría</h2>
          </div>
          <div className="p-5">
            <CategoryChart data={chartData} />
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm">Actividad reciente</h2>
            {/* TODO: conectar a tabla activity_log */}
            <span className="text-xs text-white/25 bg-white/5 px-2 py-0.5 rounded-full">Demo</span>
          </div>
          <div className="divide-y divide-white/5">
            {mockActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3">
                <ActivityIcon type={item.type} />
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-sm font-medium truncate">{item.product}</p>
                  <p className="text-white/40 text-xs mt-0.5">{item.detail}</p>
                </div>
                <span className="text-white/25 text-xs shrink-0">{timeAgo(item.msAgo)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Últimos cambios (tabla) ── */}
      {recent.length > 0 && (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm">Últimas modificaciones</h2>
            <Link href="/admin/productos" className="text-yellow-400 hover:text-yellow-300 text-xs transition-colors">
              Ver todos →
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {recent.map((p) => (
              <div key={p.id} className="px-5 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${p.activo ? 'bg-green-400' : 'bg-white/20'}`} />
                  <span className="text-white/80 text-sm truncate">{p.nombre}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StockBadge stock={p.stock} />
                  <Link
                    href={`/admin/productos/${p.id}/editar`}
                    className="p-1.5 rounded text-white/20 hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Estado del sistema ── */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-white/30">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
          <span>Sesión activa como <span className="text-white/50">{userEmail}</span></span>
        </div>
        {lastUpdate && (
          <span>
            Último cambio en catálogo:{' '}
            <span className="text-white/50">
              {new Date(lastUpdate).toLocaleDateString('es-AR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </span>
          </span>
        )}
      </div>

    </div>
  );
}

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">Sin stock</span>;
  if (stock <= 2) return <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 font-medium">{stock} u.</span>;
  if (stock <= 5) return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-medium">{stock} u.</span>;
  return <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 font-medium">{stock} u.</span>;
}
