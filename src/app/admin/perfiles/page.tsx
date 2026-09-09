import { redirect } from 'next/navigation';
import { getUserRole } from '@/lib/supabase/server';
import { fetchPerfiles, changeUserRoleAction } from '@/app/admin/actions';

async function requireAdmin() {
  const role = await getUserRole();
  if (role !== 'admin') redirect('/admin/dashboard');
}

export default async function PerfilesPage() {
  await requireAdmin();
  const perfiles = await fetchPerfiles();

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Gestionar usuarios</h1>
        <p className="text-white/40 text-sm mt-0.5">
          Cambiá el rol de cada usuario. Solo admin puede ver esta página.
        </p>
      </div>

      <div className="space-y-2">
        {perfiles.map((p) => {
          const isAdmin = p.rol === 'admin';
          return (
            <form key={p.id} action={async () => {
              'use server';
              await changeUserRoleAction(p.id, p.rol);
            }} className="flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-xl px-5 py-4 hover:border-white/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  isAdmin ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {p.email[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{p.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  isAdmin ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {isAdmin ? 'Admin' : 'Empleado'}
                </span>
                <button
                  type="submit"
                  className="text-xs bg-white/5 hover:bg-white/10 text-white/60 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  Cambiar a {isAdmin ? 'Empleado' : 'Admin'}
                </button>
              </div>
            </form>
          );
        })}
      </div>
    </div>
  );
}
