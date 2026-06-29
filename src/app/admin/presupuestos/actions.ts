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

interface NuevoPresupuestoInput {
  clienteId: string;
  condicionPago: string;
  descuentoPct: number;
  ivaPct: number;
  notas: string;
  estado: 'borrador' | 'enviado';
  subtotal: number;
  descuentoMonto: number;
  ivaMonto: number;
  total: number;
  fechaVencimiento: string;
  items: { descripcion: string; cantidad: number; precio_unitario: number; orden: number }[];
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

export async function crearPresupuesto(input: NuevoPresupuestoInput): Promise<{ id: string } | { error: string }> {
  const sb = createAdminClient();

  const { data: pres, error: err1 } = await sb
    .from('presupuestos')
    .insert({
      cliente_id: input.clienteId,
      condicion_pago: input.condicionPago,
      descuento_pct: input.descuentoPct,
      iva_pct: input.ivaPct,
      notas: input.notas || null,
      estado: input.estado,
      subtotal: input.subtotal,
      descuento_monto: input.descuentoMonto,
      iva_monto: input.ivaMonto,
      total: input.total,
      fecha_vencimiento: input.fechaVencimiento,
    })
    .select('id')
    .single();

  if (err1 || !pres) return { error: err1?.message ?? 'Error al crear presupuesto' };

  const { error: err2 } = await sb.from('presupuesto_items').insert(
    input.items.map((item) => ({
      presupuesto_id: pres.id,
      descripcion: item.descripcion,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      subtotal: item.cantidad * item.precio_unitario,
      orden: item.orden,
    }))
  );

  if (err2) return { error: err2.message };
  return { id: pres.id };
}
