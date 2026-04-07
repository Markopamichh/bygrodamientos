'use client';

import { useTransition } from 'react';
import { toggleProductActiveAction } from '@/app/admin/actions';

export default function ProductToggle({ id, activo }: { id: string; activo: boolean }) {
  const [isPending, startTransition] = useTransition();

  const toggle = () => {
    startTransition(async () => {
      await toggleProductActiveAction(id, !activo);
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      title={activo ? 'Desactivar producto' : 'Activar producto'}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-150 focus:outline-none ${
        isPending ? 'opacity-50 cursor-wait' : 'cursor-pointer'
      } ${activo ? 'bg-yellow-500' : 'bg-white/20'}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-150 ${
          activo ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}
