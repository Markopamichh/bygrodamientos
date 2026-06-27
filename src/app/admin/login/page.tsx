import { Suspense } from 'react';
import LoginForm from './LoginForm';

export const metadata = { title: 'Panel Admin — BYG Rodamientos' };

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 mb-4">
            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-9 0a9 9 0 1018 0 9 9 0 10-18 0" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 12m-3 0a3 3 0 106 0 3 3 0 10-6 0" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3M12 18v3M3 12h3M18 12h3" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Panel Administrativo</h1>
          <p className="text-white/40 text-sm">BYG Rodamientos</p>
        </div>

        {/* Card */}
        <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
          <Suspense fallback={<div className="h-64 animate-pulse bg-white/5 rounded-lg" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-white/20 text-xs mt-6">
          Acceso restringido — solo personal autorizado
        </p>
      </div>
    </div>
  );
}
