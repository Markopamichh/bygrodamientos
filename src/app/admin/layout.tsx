import { createClient } from '@/lib/supabase/server';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    // Fixed overlay covers the public site Header/Footer completely
    <div
      className="fixed inset-0 z-[9999] flex overflow-hidden"
      style={{ fontFamily: 'var(--font-body)', background: '#111' }}
    >
      {user && <AdminSidebar />}
      <div className="flex-1 overflow-auto bg-[#111]">{children}</div>
    </div>
  );
}
