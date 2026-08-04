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

const opcionalNumero = z.preprocess(
  (v) => (v === '' || v === null || v === undefined ? null : v),
  z.coerce.number().min(0).nullable().optional()
);

const movimientoSchema = z.object({
  item_id: z.string().uuid(),
  tipo: z.enum(['venta', 'ingreso', 'ajuste', 'devolucion']),
  cantidad: z.coerce.number().int().min(1, 'La cantidad debe ser al menos 1'),
  direccion_ajuste: z.enum(['sumar', 'restar']).optional(),
  nota: z.string().max(300).optional(),
  // Trazabilidad
  proveedor_id: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.string().uuid().nullable().optional()
  ),
  cliente_nombre: z.string().max(150).optional(),
  factura: z.string().max(60).optional(),
  precio_unitario: opcionalNumero,
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

  const {
    item_id,
    tipo,
    cantidad,
    direccion_ajuste,
    nota,
    proveedor_id,
    cliente_nombre,
    factura,
    precio_unitario,
  } = parsed.data;

  let delta: number;
  if (tipo === 'venta') {
    delta = -cantidad;
  } else if (tipo === 'ajuste' && direccion_ajuste === 'restar') {
    delta = -cantidad;
  } else {
    delta = cantidad;
  }

  // El proveedor solo aplica a entradas; el cliente solo a ventas.
  const esEntrada = tipo === 'ingreso' || tipo === 'devolucion';

  const supabase = createAdminClient();
  const { error } = await supabase.rpc('registrar_movimiento_stock', {
    p_item_id: item_id,
    p_tipo: tipo,
    p_cantidad: delta,
    p_usuario_id: user.id,
    p_nota: nota ?? null,
    p_proveedor_id: esEntrada ? proveedor_id ?? null : null,
    p_cliente_nombre: tipo === 'venta' ? cliente_nombre?.trim() || null : null,
    p_factura: factura?.trim() || null,
    p_precio_unitario: precio_unitario ?? null,
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

// ─────────────────────────────────────────────
// EDITAR METADATA DE MOVIMIENTO (no toca stock)
// Solo proveedor/cliente/factura/precio/nota. La cantidad y el tipo no se
// editan porque cambiarían el stock; para eso se elimina y se recarga.
// ─────────────────────────────────────────────

const editarMovimientoSchema = z.object({
  proveedor_id: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.string().uuid().nullable().optional()
  ),
  cliente_nombre: z.string().max(150).optional(),
  factura: z.string().max(60).optional(),
  precio_unitario: opcionalNumero,
  nota: z.string().max(300).optional(),
});

export async function editarMovimientoAction(
  id: string,
  _prevState: MovimientoFormState,
  formData: FormData
): Promise<MovimientoFormState> {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  const parsed = editarMovimientoSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.errors.map((e) => e.message).join(', ') };
  }

  const supabase = createAdminClient();
  const { data: mov } = await supabase
    .from('movimientos_stock')
    .select('tipo')
    .eq('id', id)
    .single();

  const esEntrada = mov?.tipo === 'ingreso' || mov?.tipo === 'devolucion';
  const { error } = await supabase
    .from('movimientos_stock')
    .update({
      proveedor_id: esEntrada ? parsed.data.proveedor_id ?? null : null,
      cliente_nombre: mov?.tipo === 'venta' ? parsed.data.cliente_nombre?.trim() || null : null,
      factura: parsed.data.factura?.trim() || null,
      precio_unitario: parsed.data.precio_unitario ?? null,
      nota: parsed.data.nota?.trim() || null,
    })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/movimientos');
  revalidatePath(`/admin/movimientos/${id}`);
  redirect(`/admin/movimientos/${id}`);
}

// ─────────────────────────────────────────────
// ELIMINAR MOVIMIENTO (revierte el stock, vía RPC atómica)
// ─────────────────────────────────────────────

export async function eliminarMovimientoAction(id: string): Promise<void> {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  const supabase = createAdminClient();
  const { error } = await supabase.rpc('eliminar_movimiento_stock', {
    p_mov_id: id,
    p_usuario_id: user.id,
  });
  if (error) throw new Error(error.message);

  revalidatePath('/admin/movimientos');
  revalidatePath('/admin/stock');
  redirect('/admin/movimientos');
}

// ─────────────────────────────────────────────
// BUSCAR ÍTEM POR CÓDIGO (para registrar movimiento desde la vista global)
// ─────────────────────────────────────────────

export type ItemBusqueda = { id: string; codigo: string; nombre: string };

export async function buscarItemsPorCodigo(q: string): Promise<ItemBusqueda[]> {
  await requireAuthStock();
  if (!q || q.trim().length < 2) return [];
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('items')
    .select('id, codigo, productos(nombre)')
    .ilike('codigo', `%${q.trim()}%`)
    .order('codigo')
    .limit(20);
  return (data ?? []).map((d) => ({
    id: d.id as string,
    codigo: d.codigo as string,
    nombre: (d.productos as unknown as { nombre: string } | null)?.nombre ?? '',
  }));
}

async function requireAuthStock() {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');
  return user;
}

// ─────────────────────────────────────────────
// REGISTRAR MOVIMIENTO MÚLTIPLE
// Una factura suele traer varios ítems. Los datos de cabecera (tipo, proveedor,
// cliente, factura) se comparten y cada renglón se guarda como un movimiento
// propio, todos con la misma factura. Se usa la RPC por renglón para que cada
// uno actualice el stock de forma atómica.
// ─────────────────────────────────────────────

export type LineaMovimiento = {
  item_id: string;
  codigo: string;
  cantidad: number;
  precio_unitario: number | null;
};

export type MovimientoMultipleInput = {
  tipo: 'venta' | 'ingreso' | 'ajuste' | 'devolucion';
  direccion_ajuste?: 'sumar' | 'restar';
  proveedor_id?: string | null;
  cliente_nombre?: string | null;
  factura?: string | null;
  nota?: string | null;
  lineas: LineaMovimiento[];
};

export type MovimientoMultipleState = {
  error?: string;
  /** Errores por renglón, para señalar cuáles fallaron. */
  fallidos?: { codigo: string; motivo: string }[];
  registrados?: number;
  success?: boolean;
};

export async function registrarMovimientoMultipleAction(
  input: MovimientoMultipleInput
): Promise<MovimientoMultipleState> {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  const { tipo, direccion_ajuste, proveedor_id, cliente_nombre, factura, nota, lineas } = input;

  if (!lineas?.length) return { error: 'Agregá al menos un ítem' };
  if (!['venta', 'ingreso', 'ajuste', 'devolucion'].includes(tipo)) {
    return { error: 'Tipo de movimiento inválido' };
  }
  for (const l of lineas) {
    if (!l.item_id) return { error: 'Hay un renglón sin ítem seleccionado' };
    if (!Number.isInteger(l.cantidad) || l.cantidad < 1) {
      return { error: `Cantidad inválida en ${l.codigo || 'un renglón'}` };
    }
  }

  const esEntrada = tipo === 'ingreso' || tipo === 'devolucion';
  const supabase = createAdminClient();

  const fallidos: { codigo: string; motivo: string }[] = [];
  let registrados = 0;

  for (const l of lineas) {
    let delta: number;
    if (tipo === 'venta') delta = -l.cantidad;
    else if (tipo === 'ajuste' && direccion_ajuste === 'restar') delta = -l.cantidad;
    else delta = l.cantidad;

    const { error } = await supabase.rpc('registrar_movimiento_stock', {
      p_item_id: l.item_id,
      p_tipo: tipo,
      p_cantidad: delta,
      p_usuario_id: user.id,
      p_nota: nota?.trim() || null,
      p_proveedor_id: esEntrada ? proveedor_id ?? null : null,
      p_cliente_nombre: tipo === 'venta' ? cliente_nombre?.trim() || null : null,
      p_factura: factura?.trim() || null,
      p_precio_unitario: l.precio_unitario ?? null,
    });

    // Se sigue con los demás renglones: los que entraron quedan registrados y
    // se informa cuáles fallaron (ej. stock insuficiente en una venta).
    if (error) fallidos.push({ codigo: l.codigo, motivo: error.message });
    else registrados++;
  }

  revalidatePath('/admin/movimientos');
  revalidatePath('/admin/stock');

  if (registrados === 0) {
    return { error: 'No se pudo registrar ningún ítem', fallidos };
  }
  return { success: true, registrados, fallidos: fallidos.length ? fallidos : undefined };
}
