'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showSidebar = pathname !== '/admin/login';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="fixed inset-0 z-[9999] flex overflow-hidden"
      style={{ fontFamily: 'var(--font-body)', background: '#111' }}
    >
      {showSidebar && (
        <>
          {/* Mobile overlay */}
          <div
            className={`fixed inset-0 bg-black/60 z-40 md:hidden transition-opacity duration-300 ${
              sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={() => setSidebarOpen(false)}
          />
          <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </>
      )}

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top bar */}
        {showSidebar && (
          <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] border-b border-white/10 shrink-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Abrir menú"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <span className="text-white font-semibold text-sm">BYG Admin</span>
          </div>
        )}

        <div className="flex-1 overflow-auto bg-[#111]">{children}</div>
      </div>
    </div>
  );
}
