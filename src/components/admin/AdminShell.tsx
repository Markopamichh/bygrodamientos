'use client';

import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = pathname !== '/admin/login';

  return (
    <div
      className="fixed inset-0 z-[9999] flex overflow-hidden"
      style={{ fontFamily: 'var(--font-body)', background: '#111' }}
    >
      {showSidebar && <AdminSidebar />}
      <div className="flex-1 overflow-auto bg-[#111]">{children}</div>
    </div>
  );
}
