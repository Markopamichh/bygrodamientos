'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { loginAction, type LoginState } from '@/app/admin/actions';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-yellow-500/50 disabled:cursor-not-allowed text-black font-semibold py-3 px-4 rounded-lg transition-colors duration-150 flex items-center justify-center gap-2"
    >
      {pending && (
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {pending ? 'Iniciando sesión...' : 'Iniciar sesión'}
    </button>
  );
}

function BlockedTimer({ blockExpiresAt }: { blockExpiresAt: string }) {
  const [remaining, setRemaining] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(blockExpiresAt).getTime() - Date.now();
      if (diff <= 0) {
        setRemaining('0:00');
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(`${mins}:${secs.toString().padStart(2, '0')}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [blockExpiresAt]);

  return (
    <p className="text-red-400/80 text-sm text-center">
      Tiempo de espera:{' '}
      <span className="font-mono font-bold text-red-400">{remaining}</span>
    </p>
  );
}

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [state, formAction] = useFormState<LoginState, FormData>(loginAction, {});

  const isBlocked = state.remainingAttempts === 0 && !!state.blockExpiresAt;
  const showRemainingWarning =
    typeof state.remainingAttempts === 'number' && state.remainingAttempts <= 2 && !isBlocked;

  return (
    <form action={formAction} className="space-y-4">
      {/* Session timeout notice */}
      {searchParams.get('timeout') && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-yellow-400 text-sm text-center">
          Tu sesión expiró por inactividad. Iniciá sesión nuevamente.
        </div>
      )}

      {/* Error */}
      {state.error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm text-center">
          {state.error}
        </div>
      )}

      {/* Remaining attempts warning */}
      {showRemainingWarning && (
        <p className="text-yellow-400/80 text-sm text-center">
          Intentos restantes:{' '}
          <span className="font-bold text-yellow-400">{state.remainingAttempts}</span>
        </p>
      )}

      {/* Blocked timer */}
      {isBlocked && state.blockExpiresAt && (
        <BlockedTimer blockExpiresAt={state.blockExpiresAt} />
      )}

      <div>
        <label htmlFor="email" className="block text-sm text-white/60 mb-1.5">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          disabled={isBlocked}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30 transition-colors disabled:opacity-50"
          placeholder="admin@byg.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm text-white/60 mb-1.5">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          disabled={isBlocked}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/30 transition-colors disabled:opacity-50"
          placeholder="••••••••"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
