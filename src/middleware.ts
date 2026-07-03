import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') ?? '';

  // Subdominio admin → reescribir a /admin/:path*
  if (host === 'admin.bygrodamientos.com.ar') {
    const adminPath = pathname === '/' ? '/admin' : `/admin${pathname}`;
    const url = request.nextUrl.clone();
    url.pathname = adminPath;
    return NextResponse.rewrite(url);
  }

  // Solo proteger rutas /admin, excepto /admin/login
  if (!pathname.startsWith('/admin') || pathname.startsWith('/admin/login')) {
    return NextResponse.next();
  }

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
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/((?!_next|favicon.ico|images|og-image.png).*)'],
};
