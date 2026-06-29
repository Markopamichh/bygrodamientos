'use server';

import { createAdminClient } from '@/lib/supabase/server';

interface ClientePayload {
  nombre: string;
  razon_social?: string | null;
  cuit_cuil?: string | null;
  condicion_iva: string;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  notas?: string | null;
}

export async function fetchClientes() {
  const sb = createAdminClient();
  const { data } = await sb.from('clientes').select('*').eq('activo', true).order('nombre');
  return data ?? [];
}

export async function insertCliente(payload: ClientePayload): Promise<{ error?: string }> {
  const sb = createAdminClient();
  const { error } = await sb.from('clientes').insert(payload);
  return error ? { error: error.message } : {};
}

export async function updateCliente(id: string, payload: ClientePayload): Promise<{ error?: string }> {
  const sb = createAdminClient();
  const { error } = await sb.from('clientes').update(payload).eq('id', id);
  return error ? { error: error.message } : {};
}
