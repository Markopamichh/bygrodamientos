'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createAuthClient, createAdminClient } from '@/lib/supabase/server';

async function getSessionUser() {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Genera un slug único para productos a partir del nombre. */
async function generarSlugUnico(
  supabase: ReturnType<typeof createAdminClient>,
  nombre: string
): Promise<string> {
  const base =
    nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'item';

  const { data } = await supabase.from('productos').select('slug').like('slug', `${base}%`);
  const usados = new Set((data ?? []).map((d) => d.slug as string));
  if (!usados.has(base)) return base;
  for (let i = 2; i < 1000; i++) {
    const cand = `${base}-${i}`;
    if (!usados.has(cand)) return cand;
  }
  return `${base}-${Date.now()}`;
}

// ─────────────────────────────────────────────
// CREATE ITEM
// ─────────────────────────────────────────────

const itemSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(200),
  rubro: z.string().max(100).optional(),
  codigo: z.string().min(1, 'El código es requerido').max(50),
  fabricante: z.string().max(100).optional(),
  numero_parte: z.string().max(100).optional(),
  medida_interna: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.coerce.number().min(0).nullable().optional()
  ),
  medida_externa: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.coerce.number().min(0).nullable().optional()
  ),
  ancho: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.coerce.number().min(0).nullable().optional()
  ),
  stock_inicial: z.coerce.number().int().min(0).default(0),
  stock_minimo: z.coerce.number().int().min(0).default(0),
  precio_costo: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.coerce.number().min(0).nullable().optional()
  ),
  precio_venta: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.coerce.number().min(0).nullable().optional()
  ),
  ubicacion: z.string().max(100).optional(),
  activo: z.preprocess((v) => v === 'true' || v === true, z.boolean()).default(true),
});

export type ItemFormState = {
  error?: string;
  errors?: Record<string, string[]>;
};

export async function createItemAction(
  _prevState: ItemFormState,
  formData: FormData
): Promise<ItemFormState> {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  const parsed = itemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { stock_inicial, ...rest } = parsed.data;
  const supabase = createAdminClient();

  // El ítem de stock necesita un producto asociado. Se crea uno interno
  // (activo=false) para que no aparezca en la web pública.
  const rubro = rest.rubro?.trim() || null;
  const slug = await generarSlugUnico(supabase, rest.nombre);
  const { data: newProducto, error: prodError } = await supabase
    .from('productos')
    .insert({
      nombre: rest.nombre,
      slug,
      subcategoria: rubro,
      fabricante: rest.fabricante ?? null,
      stock: stock_inicial,
      precio: rest.precio_venta ?? null,
      tipo_disponibilidad: 'stock',
      activo: false,
    })
    .select('id')
    .single();

  if (prodError || !newProducto) {
    return { error: prodError?.message ?? 'No se pudo crear el producto asociado' };
  }

  const { data: newItem, error } = await supabase
    .from('items')
    .insert({
      producto_id: newProducto.id,
      codigo: rest.codigo,
      fabricante: rest.fabricante ?? null,
      numero_parte: rest.numero_parte ?? null,
      medida_interna: rest.medida_interna ?? null,
      medida_externa: rest.medida_externa ?? null,
      ancho: rest.ancho ?? null,
      stock_actual: stock_inicial,
      stock_minimo: rest.stock_minimo,
      precio_costo: rest.precio_costo ?? null,
      precio_venta: rest.precio_venta ?? null,
      ubicacion: rest.ubicacion ?? null,
      activo: rest.activo,
    })
    .select('id')
    .single();

  if (error) {
    // Evitar dejar el producto huérfano si falla la creación del ítem.
    await supabase.from('productos').delete().eq('id', newProducto.id);
    return { error: error.message };
  }

  if (stock_inicial > 0 && newItem) {
    await supabase.from('movimientos_stock').insert({
      item_id: newItem.id,
      tipo: 'ingreso',
      cantidad: stock_inicial,
      stock_resultante: stock_inicial,
      usuario_id: user.id,
      nota: 'Stock inicial',
    });
  }

  revalidatePath('/admin/stock');
  redirect('/admin/stock');
}

// ─────────────────────────────────────────────
// UPDATE ITEM
// ─────────────────────────────────────────────

const updateItemSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(200),
  rubro: z.string().max(100).optional(),
  codigo: z.string().min(1, 'El código es requerido').max(50),
  fabricante: z.string().max(100).optional(),
  numero_parte: z.string().max(100).optional(),
  medida_interna: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.coerce.number().min(0).nullable().optional()
  ),
  medida_externa: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.coerce.number().min(0).nullable().optional()
  ),
  ancho: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.coerce.number().min(0).nullable().optional()
  ),
  stock_minimo: z.coerce.number().int().min(0).default(0),
  precio_costo: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.coerce.number().min(0).nullable().optional()
  ),
  precio_venta: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.coerce.number().min(0).nullable().optional()
  ),
  ubicacion: z.string().max(100).optional(),
  activo: z.preprocess((v) => v === 'true' || v === true, z.boolean()).default(true),
});

export async function updateItemAction(
  id: string,
  _prevState: ItemFormState,
  formData: FormData
): Promise<ItemFormState> {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  const parsed = updateItemSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = createAdminClient();

  // Nombre y rubro viven en el producto asociado al ítem.
  const { data: itemActual } = await supabase
    .from('items')
    .select('producto_id')
    .eq('id', id)
    .single();

  if (itemActual?.producto_id) {
    const { error: prodError } = await supabase
      .from('productos')
      .update({
        nombre: parsed.data.nombre,
        subcategoria: parsed.data.rubro?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemActual.producto_id);
    if (prodError) return { error: prodError.message };
  }

  const { error } = await supabase
    .from('items')
    .update({
      codigo: parsed.data.codigo,
      fabricante: parsed.data.fabricante ?? null,
      numero_parte: parsed.data.numero_parte ?? null,
      medida_interna: parsed.data.medida_interna ?? null,
      medida_externa: parsed.data.medida_externa ?? null,
      ancho: parsed.data.ancho ?? null,
      stock_minimo: parsed.data.stock_minimo,
      precio_costo: parsed.data.precio_costo ?? null,
      precio_venta: parsed.data.precio_venta ?? null,
      ubicacion: parsed.data.ubicacion ?? null,
      activo: parsed.data.activo,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath(`/admin/stock/${id}`);
  revalidatePath('/admin/stock');
  redirect(`/admin/stock/${id}`);
}

// ─────────────────────────────────────────────
// REGISTRAR MOVIMIENTO (vía RPC atómica)
// ─────────────────────────────────────────────

const movimientoSchema = z.object({
  item_id: z.string().uuid(),
  tipo: z.enum(['venta', 'ingreso', 'ajuste', 'devolucion']),
  cantidad: z.coerce.number().int().min(1, 'La cantidad debe ser al menos 1'),
  direccion_ajuste: z.enum(['sumar', 'restar']).optional(),
  nota: z.string().max(300).optional(),
});

export type MovimientoFormState = {
  error?: string;
  success?: boolean;
};

export async function registrarMovimientoAction(
  _prevState: MovimientoFormState,
  formData: FormData
): Promise<MovimientoFormState> {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  const parsed = movimientoSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors.map((e) => e.message).join(', ') };
  }

  const { item_id, tipo, cantidad, direccion_ajuste, nota } = parsed.data;

  let delta: number;
  if (tipo === 'venta') {
    delta = -cantidad;
  } else if (tipo === 'ajuste' && direccion_ajuste === 'restar') {
    delta = -cantidad;
  } else {
    delta = cantidad;
  }

  const supabase = createAdminClient();
  const { error } = await supabase.rpc('registrar_movimiento_stock', {
    p_item_id: item_id,
    p_tipo: tipo,
    p_cantidad: delta,
    p_usuario_id: user.id,
    p_nota: nota ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/admin/stock/${item_id}`);
  revalidatePath('/admin/stock');
  return { success: true };
}

// ─────────────────────────────────────────────
// CÓDIGOS EQUIVALENTES
// ─────────────────────────────────────────────

const codigoEquivSchema = z.object({
  item_id: z.string().uuid(),
  marca: z.string().min(1, 'La marca es requerida').max(100),
  codigo: z.string().min(1, 'El código es requerido').max(100),
});

export type CodigoEquivFormState = {
  error?: string;
  success?: boolean;
};

export async function addCodigoEquivalenteAction(
  _prevState: CodigoEquivFormState,
  formData: FormData
): Promise<CodigoEquivFormState> {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  const parsed = codigoEquivSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors.map((e) => e.message).join(', ') };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('item_codigos_equivalentes').insert(parsed.data);
  if (error) return { error: error.message };

  revalidatePath(`/admin/stock/${parsed.data.item_id}`);
  return { success: true };
}

export async function deleteCodigoEquivalenteAction(
  codigoId: string,
  itemId: string
): Promise<{ error?: string }> {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('item_codigos_equivalentes')
    .delete()
    .eq('id', codigoId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/stock/${itemId}`);
  return {};
}

// ─────────────────────────────────────────────
// IMPORTAR STOCK MASIVO
// ─────────────────────────────────────────────

export type ImportRow = {
  codigo: string;
  stock_actual: number | null;
  precio_venta: number | null;
};

export type ImportResult = {
  updated: number;
  skipped: number;
  errors: string[];
};

export async function importStockAction(rows: ImportRow[]): Promise<ImportResult> {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  const supabase = createAdminClient();
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const { data: item, error: fetchErr } = await supabase
      .from('items')
      .select('id, stock_actual')
      .eq('codigo', row.codigo)
      .maybeSingle();

    if (fetchErr || !item) {
      skipped++;
      continue;
    }

    if (row.precio_venta !== null) {
      await supabase
        .from('items')
        .update({ precio_venta: row.precio_venta, updated_at: new Date().toISOString() })
        .eq('id', item.id);
    }

    if (row.stock_actual !== null && row.stock_actual !== item.stock_actual) {
      const delta = row.stock_actual - item.stock_actual;
      const { error: rpcErr } = await supabase.rpc('registrar_movimiento_stock', {
        p_item_id: item.id,
        p_tipo: 'ajuste',
        p_cantidad: delta,
        p_usuario_id: user.id,
        p_nota: 'Importación masiva CSV',
      });
      if (rpcErr) {
        errors.push(`${row.codigo}: ${rpcErr.message}`);
        continue;
      }
    }

    updated++;
  }

  revalidatePath('/admin/stock');
  return { updated, skipped, errors };
}
