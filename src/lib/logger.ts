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

const SENSITIVE_KEYS = new Set([
  'password', 'password_hash', 'secret', 'token', 'access_token',
  'refresh_token', 'authorization', 'auth', 'api_key', 'apikey',
  'service_role', 'supabase_key', 'credentials', 'private_key',
]);

function sanitizeMetadata(data: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes('password') || lowerKey.includes('secret') || lowerKey.includes('token') || lowerKey.includes('key')) {
      clean[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      clean[key] = sanitizeMetadata(value as Record<string, unknown>);
    } else {
      clean[key] = value;
    }
  }
  return clean;
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
      metadata: metadata ? sanitizeMetadata(metadata) : null,
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
