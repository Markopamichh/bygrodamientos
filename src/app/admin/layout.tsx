import AdminShell from '@/components/admin/AdminShell';
import { createAuthClient, createAdminClient } from '@/lib/supabase/server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let lowStockCount = 0;
  if (user) {
    const admin = createAdminClient();
    const { data } = await admin
      .from('items')
      .select('stock_actual, stock_minimo')
      .eq('activo', true);
    lowStockCount = (data ?? []).filter((i) => i.stock_actual <= i.stock_minimo).length;
  }

  return (
    <AdminShell userEmail={user?.email ?? null} lowStockCount={lowStockCount}>
      {children}
    </AdminShell>
  );
}
