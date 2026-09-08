import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import AdminShell from '@/components/admin/AdminShell';
import { createAuthClient, createAdminClient, getUserRole } from '@/lib/supabase/server';

const ADMIN_ONLY_PATHS = ['/admin/productos', '/admin/categorias', '/admin/errores', '/admin/perfiles'];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Segunda capa: si el middleware no capturó la request, el layout redirige
  if (!user) {
    const headersList = await headers();
    const invokePath = headersList.get('x-invoke-path') ?? '';
    const rewrittenPath = headersList.get('x-rewritten-path') ?? '';
    const effectivePath = rewrittenPath || invokePath;
    if (!effectivePath.includes('/admin/login')) {
      redirect('/admin/login');
    }
  }

  const headersList = await headers();
  const invokePath = headersList.get('x-invoke-path') ?? '';
  const rewrittenPath = headersList.get('x-rewritten-path') ?? '';
  const pathname = rewrittenPath || invokePath;

  // Verificar rol para rutas admin-only
  const userRole = await getUserRole();
  const isAdminOnly = ADMIN_ONLY_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (isAdminOnly && userRole !== 'admin') {
    redirect('/admin/dashboard');
  }

  let lowStockCount = 0;
  if (user) {
    const admin = createAdminClient();
    const [{ data: stockData }] = await Promise.all([
      admin.from('items').select('stock_actual, stock_minimo').eq('activo', true),
      getUserRole(),
    ]);
    lowStockCount = (stockData ?? []).filter((i: { stock_actual: number; stock_minimo: number }) => i.stock_actual <= i.stock_minimo).length;
  }

  return (
    <AdminShell userEmail={user?.email ?? null} lowStockCount={lowStockCount} userRole={userRole}>
      {children}
    </AdminShell>
  );
}
