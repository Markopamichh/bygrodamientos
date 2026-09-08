/**
 * Logger de errores a la tabla `error_logs` de Supabase.
 *
 * ⚠️ SOLO SERVER-SIDE. Usa la SERVICE ROLE KEY (vía `createAdminClient`), que
 * saltea RLS para poder registrar errores incluso sin sesión activa. Nunca
 * importar este módulo desde un componente cliente: expondría la clave.
 */
import { createAdminClient } from '@/lib/supabase/server';

export type TipoError =
  | 'db_error'
  | 'auth_error'
  | 'api_error'
  | 'validation_error'
  | 'unknown';

export interface LogErrorParams {
  tipo: TipoError;
  mensaje: string;
  stack?: string;
  ruta?: string;
  usuario_id?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Registra un error en `error_logs`. Es "best-effort": nunca lanza ni rompe la
 * app. Si el insert falla, cae a `console.error` y sigue.
 */
export async function logError(params: LogErrorParams): Promise<void> {
  const { tipo, mensaje, stack, ruta, usuario_id, metadata } = params;

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('error_logs').insert({
      tipo,
      mensaje,
      stack: stack ?? null,
      ruta: ruta ?? null,
      usuario_id: usuario_id ?? null,
      metadata: metadata ?? null,
    });

    // El insert puede devolver error sin lanzar (ej. columna faltante).
    if (error) {
      console.error('[logError] no se pudo registrar el error:', error.message, {
        tipo,
        mensaje,
      });
    }
  } catch (e) {
    // Falla dura (red, config, service key ausente): no debe tumbar el flujo.
    console.error('[logError] excepción al registrar el error:', e, { tipo, mensaje });
  }
}
