import { createAdminClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Movimientos — Admin BYG' };

const TIPOS = [
  { value: 'ingreso', label: 'Ingresos' },
  { value: 'venta', label: 'Ventas' },
  { value: 'devolucion', label: 'Devoluciones' },
  { value: 'ajuste', label: 'Ajustes' },
];

interface SearchParams {
  tipo?: string;
  q?: string;
  proveedor?: string;
}

interface MovRow {
  id: string;
  tipo: string;
  cantidad: number;
  stock_resultante: number;
  nota: string | null;
  factura: string | null;
  precio_unitario: number | null;
  cliente_nombre: string | null;
  created_at: string;
  item_id: string;
  items: { codigo: string; productos: { nombre: string } | null } | null;
  proveedores: { nombre: string } | null;
}

export default async function MovimientosPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { tipo, q, proveedor } = await searchParams;
  const supabase = createAdminClient();

  const sel =
    'id, tipo, cantidad, stock_resultante, nota, factura, precio_unitario, cliente_nombre, created_at, item_id, items!inner(codigo, productos(nombre)), proveedores(nombre)';

  let query = supabase
    .from('movimientos_stock')
    .select(sel)
    .order('created_at', { ascending: false })
    .limit(300);

  if (tipo) query = query.eq('tipo', tipo);
  if (proveedor) query = query.eq('proveedor_id', proveedor);
  if (q) query = query.ilike('items.codigo', `%${q}%`);

  const [{ data: movs }, { data: proveedores }] = await Promise.all([
    query,
    supabase.from('proveedores').select('id, nombre').order('nombre'),
  ]);

  const movimientos = (movs ?? []) as unknown as MovRow[];

  const fmt = (n: number | null) =>
    n != null ? `$${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : '—';
  const fmtDate = (s: string) =>
    new Date(s).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  const qs = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const base = { tipo, q, proveedor, ...patch };
    Object.entries(base).forEach(([k, v]) => {
      if (v) p.set(k, v);
    });
    const s = p.toString();
    return `/admin/movimientos${s ? `?${s}` : ''}`;
  };

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Movimientos</h1>
        <p className="text-white/40 text-sm mt-0.5">
          {movimientos.length} movimiento{movimientos.length !== 1 ? 's' : ''}
          {movimientos.length === 300 ? ' (últimos 300)' : ''}
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <Link
          href={qs({ tipo: undefined })}
          className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
            !tipo ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400' : 'border-white/10 text-white/60 hover:text-white'
          }`}
        >
          Todos
        </Link>
        {TIPOS.map((t) => (
          <Link
            key={t.value}
            href={qs({ tipo: t.value })}
            className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              tipo === t.value ? 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400' : 'border-white/10 text-white/60 hover:text-white'
            }`}
          >
            {t.label}
          </Link>
        ))}

        <form method="GET" className="flex gap-2 ml-auto">
          {tipo && <input type="hidden" name="tipo" value={tipo} />}
          {proveedor && <input type="hidden" name="proveedor" value={proveedor} />}
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar por código..."
            className="bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder-white/30 text-sm focus:outline-none focus:border-yellow-500/50 w-44"
          />
          <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 px-3 py-1.5 rounded-lg text-sm">
            Buscar
          </button>
        </form>
      </div>

      {/* Filtro proveedor */}
      {(proveedores ?? []).length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="text-white/30 text-xs uppercase tracking-wider">Proveedor:</span>
          <Link
            href={qs({ proveedor: undefined })}
            className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
              !proveedor ? 'border-yellow-500/40 text-yellow-400' : 'border-white/10 text-white/50 hover:text-white'
            }`}
          >
            Todos
          </Link>
          {(proveedores ?? []).map((p) => (
            <Link
              key={p.id as string}
              href={qs({ proveedor: p.id as string })}
              className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${
                proveedor === p.id ? 'border-yellow-500/40 text-yellow-400' : 'border-white/10 text-white/50 hover:text-white'
              }`}
            >
              {p.nombre as string}
            </Link>
          ))}
        </div>
      )}

      {/* Tabla */}
      <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-white/10">
                <Th>Fecha</Th>
                <Th>Ítem</Th>
                <Th>Tipo</Th>
                <Th>Cant.</Th>
                <Th>Proveedor / Cliente</Th>
                <Th className="hidden sm:table-cell">Factura</Th>
                <Th className="hidden lg:table-cell">Precio unit.</Th>
                <Th className="hidden md:table-cell">Nota</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {movimientos.map((m) => (
                <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-white/40 text-xs whitespace-nowrap">{fmtDate(m.created_at)}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/stock/${m.item_id}`} className="group">
                      <span className="text-white/90 text-sm font-mono group-hover:text-yellow-400 transition-colors">
                        {m.items?.codigo ?? '—'}
                      </span>
                      <span className="block text-white/30 text-xs truncate max-w-[180px]">
                        {m.items?.productos?.nombre ?? ''}
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <TipoBadge tipo={m.tipo} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-mono font-medium ${m.cantidad >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {m.cantidad >= 0 ? '+' : ''}
                      {m.cantidad}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-white/70 text-sm">
                      {m.proveedores?.nombre ?? m.cliente_nombre ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="text-white/50 text-sm font-mono">{m.factura ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className="text-white/50 text-sm">{fmt(m.precio_unitario)}</span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-white/40 text-sm truncate block max-w-[160px]">{m.nota ?? '—'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {movimientos.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-white/30 text-sm">Sin movimientos para este filtro</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={`text-left px-4 py-3 text-xs text-white/40 font-medium uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
}

function TipoBadge({ tipo }: { tipo: string }) {
  const map: Record<string, { label: string; className: string }> = {
    ingreso: { label: 'Ingreso', className: 'bg-green-500/15 text-green-400' },
    venta: { label: 'Venta', className: 'bg-red-500/15 text-red-400' },
    devolucion: { label: 'Devolución', className: 'bg-blue-500/15 text-blue-400' },
    ajuste: { label: 'Ajuste', className: 'bg-yellow-500/15 text-yellow-400' },
  };
  const { label, className } = map[tipo] ?? { label: tipo, className: 'bg-white/10 text-white/40' };
  return <span className={`inline-flex text-xs px-2 py-0.5 rounded-full font-medium ${className}`}>{label}</span>;
}
