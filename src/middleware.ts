import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') ?? '';
  const isAdminSubdomain = host === 'admin.bygrodamientos.com.ar';

  // En el subdominio admin, mapear paths al equivalente /admin/*
  // /        → /admin
  // /login   → /admin/login
  // /stock   → /admin/stock
  // (si ya viene con /admin/* lo dejamos pasar igual para evitar doble prefijo)
  let effectivePath = pathname;
  if (isAdminSubdomain && !pathname.startsWith('/admin')) {
    effectivePath = pathname === '/' ? '/admin' : `/admin${pathname}`;
  }

  // Rutas que no requieren protección
  const isLoginPath = effectivePath === '/admin/login' || effectivePath.startsWith('/admin/login');
  const isAdminPath = effectivePath.startsWith('/admin');

  if (!isAdminPath || isLoginPath) {
    if (isAdminSubdomain && !isLoginPath) {
      // Cualquier ruta pública en el subdominio admin → redirect al login del subdominio
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Verificar autenticación
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // En el subdominio, redirigir a /login (que mapea a /admin/login)
    const loginUrl = isAdminSubdomain ? '/login' : '/admin/login';
    return NextResponse.redirect(new URL(loginUrl, request.url));
  }

  // Autenticado: si es subdominio, hacer rewrite al path real de /admin
  if (isAdminSubdomain && effectivePath !== pathname) {
    const url = request.nextUrl.clone();
    url.pathname = effectivePath;
    return NextResponse.rewrite(url);
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/((?!_next|favicon.ico|images|og-image.png|sitemap.xml|robots.txt).*)'],
};
