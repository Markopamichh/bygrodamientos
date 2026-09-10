'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createAuthClient, createAdminClient, requireRole } from '@/lib/supabase/server';
import { logError } from '@/lib/logger';




async function getSessionUser() {
  const supabase = await createAuthClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// ─────────────────────────────────────────────
// Rate limiting
// ─────────────────────────────────────────────
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 min

async function checkRateLimit(ip: string) {
  const supabase = createAdminClient();
  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString();

  const { count } = await supabase
    .from('login_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .gte('attempted_at', windowStart);

  const attempts = count ?? 0;

  if (attempts >= MAX_ATTEMPTS) {
    const { data: oldest } = await supabase
      .from('login_attempts')
      .select('attempted_at')
      .eq('ip_address', ip)
      .gte('attempted_at', windowStart)
      .order('attempted_at', { ascending: true })
      .limit(1)
      .single();

    const blockExpiresAt = oldest
      ? new Date(new Date(oldest.attempted_at).getTime() + WINDOW_MS)
      : new Date(Date.now() + WINDOW_MS);
    return { blocked: true, remainingAttempts: 0, blockExpiresAt };
  }

  return { blocked: false, remainingAttempts: MAX_ATTEMPTS - attempts, blockExpiresAt: undefined };
}

async function recordFailedAttempt(ip: string) {
  const supabase = createAdminClient();
  await supabase.from('login_attempts').insert({
    ip_address: ip,
    attempted_at: new Date().toISOString(),
  });
}

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginState = {
  error?: string;
  remainingAttempts?: number;
  blockExpiresAt?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const headersList = await headers();
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip');

  if (!ip) return { error: 'No se pudo verificar la sesión. Intentá de nuevo.' };

  const rateLimit = await checkRateLimit(ip);
  if (rateLimit.blocked) {
    return {
      error: 'Demasiados intentos fallidos. Tu IP ha sido bloqueada temporalmente.',
      remainingAttempts: 0,
      blockExpiresAt: rateLimit.blockExpiresAt?.toISOString(),
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    await recordFailedAttempt(ip);
    return { error: 'Credenciales incorrectas', remainingAttempts: rateLimit.remainingAttempts - 1 };
  }

  const supabase = await createAuthClient();
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (authError) {
    await recordFailedAttempt(ip);
    return {
      error: 'Credenciales incorrectas',
      remainingAttempts: rateLimit.remainingAttempts - 1,
    };
  }

  // Auto-crear o actualizar el perfil con rol 'empleado' por defecto
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const admin = createAdminClient();
    await admin.from('usuarios').upsert({
      id: user.id,
      rol: 'empleado',
      email: user.email,
    }).select().single();

    // Auto-promote atómico: si no hay admin, el primero se vuelve admin
    const { count } = await admin.from('usuarios').select('*', { count: 'exact', head: true }).eq('rol', 'admin');
    if ((count ?? 0) === 0) {
      await admin.from('usuarios').update({ rol: 'admin' }).eq('id', user.id);
    }
  }

  redirect('/admin/dashboard');
}

export async function logoutAction() {
  const supabase = await createAuthClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}

// ─────────────────────────────────────────────
// PRODUCTS
// ─────────────────────────────────────────────
const productSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(200),
  slug: z
    .string()
    .min(1, 'El slug es requerido')
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  descripcion: z.string().max(500).optional(),
  descripcion_larga: z.string().max(3000).optional(),
  categoria_id: z.string().min(1, 'Categoría inválida'),
  subcategoria: z.string().max(100).optional(),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo'),
  precio: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.coerce.number().min(0).nullable()
  ),
  imagen_url: z.preprocess(
    (v) => (v === '' ? null : v),
    z
      .string()
      .refine(
        (v) => v.startsWith('/') || v.startsWith('http://') || v.startsWith('https://'),
        'Debe ser una URL (https://...) o una ruta relativa (/images/...)'
      )
      .nullable()
      .optional()
  ),
  fabricante: z.string().max(200).optional(),
  activo: z.preprocess((v) => v === 'true' || v === true, z.boolean()),
});

export type ProductFormState = {
  error?: string;
  errors?: Record<string, string[]>;
};

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = createAdminClient();
  const { data: cat } = await supabase
    .from('categorias')
    .select('nombre, slug')
    .eq('id', parsed.data.categoria_id)
    .single();

  const { error } = await supabase.from('productos').insert({
    ...parsed.data,
    categoria_nombre: cat?.nombre ?? '',
    categoria_slug: cat?.slug ?? parsed.data.categoria_id,
    especificaciones: {},
    aplicaciones: [],
    caracteristicas: [],
  });

  if (error) return { error: error.message };

  revalidatePath('/admin/productos');
  revalidatePath('/productos', 'layout');
  redirect('/admin/productos');
}

export async function updateProductAction(
  id: string,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = createAdminClient();
  const { data: cat } = await supabase
    .from('categorias')
    .select('nombre, slug')
    .eq('id', parsed.data.categoria_id)
    .single();

  const { error } = await supabase
    .from('productos')
    .update({
      ...parsed.data,
      categoria_nombre: cat?.nombre ?? '',
      categoria_slug: cat?.slug ?? parsed.data.categoria_id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/productos');
  revalidatePath('/productos', 'layout');
  redirect('/admin/productos');
}

export async function deleteProductAction(id: string): Promise<{ error?: string }> {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  const supabase = createAdminClient();
  const { error } = await supabase.from('productos').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/productos');
  revalidatePath('/productos', 'layout');
  return {};
}

export async function toggleProductActiveAction(
  id: string,
  activo: boolean
): Promise<{ error?: string }> {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  const supabase = createAdminClient();
  const { error } = await supabase
    .from('productos')
    .update({ activo, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/productos');
  revalidatePath('/productos', 'layout');
  return {};
}

// ─────────────────────────────────────────────
// CATEGORIES
// ─────────────────────────────────────────────
const categoriaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100),
  slug: z
    .string()
    .min(1, 'El slug es requerido')
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones'),
  imagen_url: z.preprocess(
    (v) => (v === '' ? null : v),
    z.string().url('URL inválida').nullable().optional()
  ),
});

export type CategoriaFormState = {
  error?: string;
  errors?: Record<string, string[]>;
  success?: boolean;
};

export async function createCategoriaAction(
  _prevState: CategoriaFormState,
  formData: FormData
): Promise<CategoriaFormState> {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  const parsed = categoriaSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from('categorias').insert({
    nombre: parsed.data.nombre,
    slug: parsed.data.slug,
    imagen_url: parsed.data.imagen_url ?? null,
  });

  if (error) return { error: error.message };

  revalidatePath('/admin/categorias');
  revalidatePath('/admin/productos/nuevo');
  revalidatePath('/admin/productos', 'layout');
  return { success: true };
}

export async function deleteCategoriaAction(id: string): Promise<{ error?: string }> {
  const user = await getSessionUser();
  if (!user) redirect('/admin/login');

  const supabase = createAdminClient();
  const { error } = await supabase.from('categorias').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/categorias');
  revalidatePath('/admin/productos/nuevo');
  revalidatePath('/admin/productos', 'layout');
  return {};
}

// ─────────────────────────────────────────────
// EXPORT CSV
// ─────────────────────────────────────────────
export async function exportProductsCSVAction(): Promise<{ csv: string; error?: string }> {
  const user = await getSessionUser();
  if (!user) return { csv: '', error: 'No autorizado' };

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .order('nombre');

  if (error) return { csv: '', error: error.message };

  const escape = (v: unknown) => {
    const s = String(v ?? '').replace(/"/g, '""');
    return `"${s}"`;
  };

  const csvHeaders = [
    'ID', 'Nombre', 'Slug', 'Categoría', 'Subcategoría',
    'Stock', 'Precio', 'Fabricante', 'Activo', 'Imagen URL',
    'Descripción', 'Creado', 'Actualizado',
  ];

  const rows = (data ?? []).map((p) => [
    escape(p.id),
    escape(p.nombre),
    escape(p.slug),
    escape(p.categoria_nombre ?? ''),
    escape(p.subcategoria),
    p.stock,
    p.precio ?? '',
    escape(p.fabricante),
    p.activo ? 'Sí' : 'No',
    escape(p.imagen_url),
    escape(p.descripcion),
    p.created_at,
    p.updated_at,
  ]);

  const csv = [csvHeaders, ...rows].map((r) => r.join(',')).join('\n');
  return { csv };
}

// ─────────────────────────────────────────────
// IMPORT CSV
// ─────────────────────────────────────────────
function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const importRowSchema = z.object({
  nombre: z.string().min(1).max(200),
  slug: z.string().max(200).optional(),
  categoria_nombre: z.string().min(1),
  subcategoria: z.string().max(100).optional(),
  stock: z.coerce.number().int().min(0).default(0),
  precio: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? null : v),
    z.coerce.number().min(0).nullable().default(null)
  ),
  fabricante: z.string().max(200).optional(),
  imagen_url: z.preprocess(
    (v) => (v === '' || v === null ? null : v),
    z.string()
      .refine(
        (v) => v.startsWith('/') || v.startsWith('http://') || v.startsWith('https://'),
        'URL inválida'
      )
      .nullable()
      .optional()
  ),
  descripcion: z.string().max(500).optional(),
  descripcion_larga: z.string().max(3000).optional(),
  activo: z.preprocess(
    (v) => {
      if (typeof v === 'boolean') return v;
      const s = String(v ?? '').toLowerCase().trim();
      return s === 'sí' || s === 'si' || s === 'true' || s === '1' || s === 'yes';
    },
    z.boolean().default(true)
  ),
});

export type ImportRow = z.infer<typeof importRowSchema>;

export type ImportProductsResult = {
  inserted: number;
  errors: { row: number; nombre: string; message: string }[];
};

export async function importProductsAction(
  rows: Record<string, string>[]
): Promise<ImportProductsResult> {
  const user = await getSessionUser();
  if (!user) return { inserted: 0, errors: [{ row: 0, nombre: '', message: 'No autorizado' }] };

  const supabase = createAdminClient();

  // Fetch all categories once — index by nombre AND slug for flexible matching
  const { data: cats } = await supabase.from('categorias').select('id, nombre, slug');
  type CatRow = { id: string; nombre: string; slug: string };
  const catMap = new Map<string, CatRow>();
  for (const c of cats ?? []) {
    catMap.set(c.nombre.toLowerCase().trim(), c);
    catMap.set(c.slug.toLowerCase().trim(), c);
  }

  // Load existing slugs to avoid conflicts
  const { data: existingSlugs } = await supabase.from('productos').select('slug');
  const usedSlugs = new Set((existingSlugs ?? []).map((r) => r.slug as string));

  const toInsert: object[] = [];
  const errors: ImportProductsResult['errors'] = [];

  for (let i = 0; i < rows.length; i++) {
    const raw = rows[i];
    const parsed = importRowSchema.safeParse(raw);

    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
      errors.push({ row: i + 2, nombre: raw.nombre ?? '', message: msg });
      continue;
    }

    const d = parsed.data;
    const cat = catMap.get(d.categoria_nombre.toLowerCase().trim());
    if (!cat) {
      errors.push({ row: i + 2, nombre: d.nombre, message: `Categoría "${d.categoria_nombre}" no existe` });
      continue;
    }

    // Make slug unique within this batch and against existing DB slugs
    let baseSlug = d.slug ? d.slug : slugify(d.nombre);
    let slug = baseSlug;
    let counter = 2;
    while (usedSlugs.has(slug)) {
      slug = `${baseSlug}-${counter++}`;
    }
    usedSlugs.add(slug);

    toInsert.push({
      nombre: d.nombre,
      slug,
      categoria_id: cat.id,
      categoria_nombre: cat.nombre,
      categoria_slug: cat.slug,
      subcategoria: d.subcategoria ?? null,
      stock: d.stock,
      precio: d.precio,
      fabricante: d.fabricante ?? null,
      imagen_url: d.imagen_url ?? null,
      descripcion: d.descripcion ?? null,
      descripcion_larga: d.descripcion_larga ?? null,
      activo: d.activo,
      especificaciones: {},
      aplicaciones: [],
      caracteristicas: [],
    });
  }

  let inserted = 0;
  if (toInsert.length > 0) {
    const { error } = await supabase.from('productos').insert(toInsert);
    if (error) {
      // Fallback: insert one by one so partial failures don't block everything
      for (const row of toInsert) {
        const { error: rowError } = await supabase.from('productos').insert(row);
        if (rowError) {
          const r = row as Record<string, unknown>;
          errors.push({ row: 0, nombre: String(r.nombre ?? ''), message: rowError.message });
        } else {
          inserted++;
        }
      }
    } else {
      inserted = toInsert.length;
    }
    if (inserted > 0) {
      revalidatePath('/admin/productos');
      revalidatePath('/productos', 'layout');
    }
  }

  return { inserted, errors };
}

// ─────────────────────────────────────────────
// EJEMPLO: Server Action con logError + try/catch
// ─────────────────────────────────────────────
export type ProcesarPagoState = { success?: boolean; error?: string };

export async function procesarPagoAction(
  _prevState: ProcesarPagoState,
  formData: FormData
): Promise<ProcesarPagoState> {
  const user = await getSessionUser();
  if (!user) return { error: 'No autorizado' };

  const monto = Number(formData.get('monto'));
  const metodoPago = formData.get('metodo_pago') as string;

  if (!monto || monto <= 0) {
    await logError({
      tipo: 'validation_error',
      mensaje: 'Monto inválido en procesarPagoAction',
      metadata: { monto, metodoPago, usuario_id: user.id },
    });
    return { error: 'Monto inválido' };
  }

  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from('pagos').insert({
      usuario_id: user.id,
      monto,
      metodo_pago: metodoPago,
      estado: 'pendiente',
      creado_en: new Date().toISOString(),
    });

    if (error) throw error;

    return { success: true };
  } catch (e) {
    const mensaje = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : undefined;

    await logError({
      tipo: 'db_error',
      mensaje,
      stack,
      ruta: '/admin/pagos/procesar',
      usuario_id: user.id ?? undefined,
      metadata: { monto, metodoPago },
    });

    return { error: 'Error al procesar el pago' };
  }
}

// ─────────────────────────────────────────────
// OBTENER LOGS DE ERRORES
// ─────────────────────────────────────────────
export type ErrorLogRow = {
  id: string;
  created_at: string;
  tipo: string;
  mensaje: string;
  stack: string | null;
  ruta: string | null;
  usuario_id: string | null;
  metadata: Record<string, unknown> | null;
  perfil_email: string | null;
};

export async function fetchErrorLogs(): Promise<ErrorLogRow[]> {
  await requireRole('admin');
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('error_logs')
    .select(`
      id,
      created_at,
      tipo,
      mensaje,
      stack,
      ruta,
      usuario_id,
      metadata,
      usuarios:usuario_id (email)
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  const rows = (data ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    created_at: row.created_at as string,
    tipo: row.tipo as string,
    mensaje: row.mensaje as string,
    stack: (row.stack as string) ?? null,
    ruta: (row.ruta as string) ?? null,
    usuario_id: (row.usuario_id as string) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? null,
    perfil_email: (row.usuarios as Record<string, unknown>)?.email as string | null ?? null,
  }));

  return rows;
}

// ─────────────────────────────────────────────
// GESTIÓN DE PERFILES
// ─────────────────────────────────────────────
export type PerfilRow = {
  id: string;
  email: string;
  rol: string;
};

export async function fetchPerfiles(): Promise<PerfilRow[]> {
  await requireRole('admin');
  const supabase = createAdminClient();

  // Primero intentamos con email (columna de la migración)
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, email, rol')
    .order('rol');

  if (!error && data) {
    return data.map((row: Record<string, unknown>) => ({
      id: row.id as string,
      email: (row.email as string) ?? '',
      rol: row.rol as string,
    }));
  }

  // Si falló (probablemente falta la columna email), intentamos sin ella
  console.warn('fetchPerfiles: fallback sin columna email:', error?.message);
  const { data: fallback } = await supabase
    .from('usuarios')
    .select('id, rol')
    .order('rol');

  return (fallback ?? []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    email: '',
    rol: row.rol as string,
  }));
}

const roleSchema = z.enum(['admin', 'empleado']);

export async function updateUserRole(
  userId: string,
  rol: string
): Promise<{ error?: string }> {
  const parsed = roleSchema.safeParse(rol);
  if (!parsed.success) return { error: 'Rol inválido' };

  await requireRole('admin');
  const supabase = createAdminClient();

  // Prevenir que el último admin se demoted
  const { data: { user } } = await supabase.auth.getUser();
  if (user && userId === user.id && parsed.data === 'empleado') {
    const { count } = await supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('rol', 'admin');
    if ((count ?? 0) <= 1) {
      return { error: 'No podés quitarte el rol de admin. Debe haber al menos un administrador.' };
    }
  }

  const { error } = await supabase
    .from('usuarios')
    .update({ rol: parsed.data })
    .eq('id', userId);
  if (error) return { error: error.message };
  return {};
}

export async function changeUserRoleAction(
  userId: string,
  currentRole: string
): Promise<{ error?: string }> {
  'use server';
  await requireRole('admin');
  const newRole: 'admin' | 'empleado' = currentRole === 'admin' ? 'empleado' : 'admin';
  const result = await updateUserRole(userId, newRole);
  if (!result.error) revalidatePath('/admin/perfiles');
  return result;
}
