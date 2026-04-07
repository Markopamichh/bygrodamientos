'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase/server';

// ─────────────────────────────────────────────
// Auth client (user session via cookies)
// ─────────────────────────────────────────────
async function createAuthClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}

// ─────────────────────────────────────────────
// Rate limiting
// ─────────────────────────────────────────────
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 min

async function checkRateLimit(ip: string) {
  const adminSupabase = createServiceClient();
  const windowStart = new Date(Date.now() - WINDOW_MS).toISOString();

  const { count } = await adminSupabase
    .from('login_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('ip_address', ip)
    .gte('attempted_at', windowStart);

  const attempts = count ?? 0;

  if (attempts >= MAX_ATTEMPTS) {
    const { data: oldest } = await adminSupabase
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
  const adminSupabase = createServiceClient();
  await adminSupabase.from('login_attempts').insert({ ip_address: ip });
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
    headersList.get('x-real-ip') ||
    '127.0.0.1';

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
    return { error: 'Credenciales incorrectas', remainingAttempts: rateLimit.remainingAttempts };
  }

  const supabase = await createAuthClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    await recordFailedAttempt(ip);
    return {
      error: 'Credenciales incorrectas',
      remainingAttempts: rateLimit.remainingAttempts - 1,
    };
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
  categoria_id: z.string().uuid('Categoría inválida'),
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
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'No autorizado' };

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase.from('productos').insert({
    ...parsed.data,
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
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'No autorizado' };

  const parsed = productSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase
    .from('productos')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/admin/productos');
  revalidatePath('/productos', 'layout');
  redirect('/admin/productos');
}

export async function deleteProductAction(id: string): Promise<{ error?: string }> {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'No autorizado' };

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
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'No autorizado' };

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
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'No autorizado' };

  const parsed = categoriaSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { error } = await supabase.from('categorias').insert(parsed.data);
  if (error) return { error: error.message };

  revalidatePath('/admin/categorias');
  return { success: true };
}

export async function deleteCategoriaAction(id: string): Promise<{ error?: string }> {
  const supabase = await createAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'No autorizado' };

  const { error } = await supabase.from('categorias').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/admin/categorias');
  return {};
}
