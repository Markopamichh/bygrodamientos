import { fetchErrorLogs } from '@/app/admin/actions';
import { getUserRole } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

async function requireAdmin() {
  const role = await getUserRole();
  if (role !== 'admin') redirect('/admin/dashboard');
}

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Errores — Admin BYG' };

function timeAgo(date: string) {
  const msAgo = Date.now() - new Date(date).getTime();
  const m = Math.floor(msAgo / 60000);
  const h = Math.floor(msAgo / 3600000);
  const d = Math.floor(msAgo / 86400000);
  if (m < 1) return 'ahora';
  if (m < 60) return `hace ${m}m`;
  if (h < 24) return `hace ${h}h`;
  if (d === 1) return 'ayer';
  return `hace ${d} días`;
}

const tipoColors: Record<string, string> = {
  db_error: 'bg-red-500/20 text-red-400',
  auth_error: 'bg-orange-500/20 text-orange-400',
  api_error: 'bg-yellow-500/20 text-yellow-400',
  validation_error: 'bg-blue-500/20 text-blue-400',
  unknown: 'bg-gray-500/20 text-gray-400',
};

export default async function ErroresPage() {
  await requireAdmin();
  const logs = await fetchErrorLogs();

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Errores del sistema</h1>
        <p className="text-white/40 text-sm mt-0.5">
          {logs.length} error{logs.length !== 1 ? 'es' : ''} registrado{logs.length !== 1 ? 's' : ''}
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl px-6 py-12 text-center">
          <p className="text-white/30 text-sm">No hay errores registrados.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors"
            >
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tipoColors[log.tipo] ?? tipoColors.unknown}`}>
                        {log.tipo}
                      </span>
                      <span className="text-white/25 text-xs">
                        {timeAgo(log.created_at)}
                      </span>
                      {log.ruta && (
                        <span className="text-white/20 text-xs font-mono bg-white/5 px-2 py-0.5 rounded truncate max-w-[300px]">
                          {log.ruta}
                        </span>
                      )}
                    </div>
                    <p className="text-white/80 text-sm mt-2 leading-relaxed">
                      {log.mensaje}
                    </p>
                    {log.perfil_email && (
                      <p className="text-white/30 text-xs mt-1">
                        Usuario: {log.perfil_email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {(log.stack || log.metadata) && (
                <div className="border-t border-white/5 px-5 py-3 bg-black/20">
                  {log.stack && (
                    <details className="group">
                      <summary className="cursor-pointer text-white/30 text-xs hover:text-white/50 transition-colors">
                        Ver stack trace
                      </summary>
                      <pre className="mt-2 text-xs text-red-400/70 bg-black/30 rounded-lg p-3 overflow-x-auto max-h-40 overflow-y-auto">
                        {log.stack}
                      </pre>
                    </details>
                  )}
                  {log.metadata && (
                    <details className="group mt-2">
                      <summary className="cursor-pointer text-white/30 text-xs hover:text-white/50 transition-colors">
                        Ver metadata
                      </summary>
                      <pre className="mt-2 text-xs text-white/50 bg-black/30 rounded-lg p-3 overflow-x-auto max-h-40 overflow-y-auto">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
