import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') ?? '';
  const isAdminSubdomain = host === 'admin.bygrodamientos.com.ar';

  // ── Dominio principal: proteger /admin/* excepto /admin/login ──
  if (!isAdminSubdomain) {
    if (!pathname.startsWith('/admin') || pathname.startsWith('/admin/login')) {
      return NextResponse.next();
    }
    const response = NextResponse.next({ request: { headers: request.headers } });
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet: { name: string; value: string; options?: object }[]) =>
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value);
              response.cookies.set(name, value, options);
            }),
        },
      }
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.redirect(new URL('/admin/login', request.url));
    return response;
  }

  // ── Subdominio admin.bygrodamientos.com.ar ──
  // Mapear el path al equivalente /admin/*
  // /         → /admin          (dashboard)
  // /login    → /admin/login    (login)
  // /stock    → /admin/stock    (etc.)
  const targetPath = pathname === '/'
    ? '/admin'
    : pathname.startsWith('/admin')
      ? pathname                  // ya viene con /admin, dejarlo
      : `/admin${pathname}`;

  const isLoginTarget = targetPath === '/admin/login' || targetPath.startsWith('/admin/login/');

  // Verificar sesión
  const response = NextResponse.next({ request: { headers: request.headers } });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options?: object }[]) =>
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          }),
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();

  if (!user) {
    // Sin sesión → mostrar login (rewrite, sin redirect de browser)
    url.pathname = '/admin/login';
    const reqHeaders = new Headers(request.headers);
    reqHeaders.set('x-rewritten-path', '/admin/login');
    return NextResponse.rewrite(url, { request: { headers: reqHeaders } });
  }

  if (isLoginTarget) {
    // Con sesión en /login → ir al dashboard
    url.pathname = '/admin';
    return NextResponse.rewrite(url);
  }

  // Con sesión → rewrite al path correspondiente
  url.pathname = targetPath;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|images|og-image.png|sitemap.xml|robots.txt).*)',
  ],
};
