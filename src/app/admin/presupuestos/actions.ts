'use server';

import { createAdminClient } from '@/lib/supabase/server';

interface NuevoClienteInput {
  nombre: string;
  razon_social?: string | null;
  cuit_cuil?: string | null;
  email?: string | null;
  telefono?: string | null;
  condicion_iva: string;
}

export async function crearCliente(input: NuevoClienteInput): Promise<{ id: string } | { error: string }> {
  const sb = createAdminClient();
  const { data, error } = await sb
    .from('clientes')
    .insert({
      nombre: input.nombre.trim(),
      razon_social: input.razon_social?.trim() || null,
      cuit_cuil: input.cuit_cuil?.trim() || null,
      email: input.email?.trim() || null,
      telefono: input.telefono?.trim() || null,
      condicion_iva: input.condicion_iva,
      activo: true,
    })
    .select('id')
    .single();

  if (error || !data) return { error: error?.message ?? 'Error al crear el cliente' };
  return { id: data.id };
}
