import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000; // 8 hours

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminRoute = pathname.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';

  // Check session inactivity timeout
  if (user && isAdminRoute && !isLoginPage) {
    const lastActivity = request.cookies.get('byg-last-activity')?.value;
    if (lastActivity) {
      const elapsed = Date.now() - parseInt(lastActivity, 10);
      if (elapsed > SESSION_TIMEOUT_MS) {
        await supabase.auth.signOut();
        const loginUrl = new URL('/admin/login?timeout=1', request.url);
        const res = NextResponse.redirect(loginUrl);
        res.cookies.delete('byg-last-activity');
        return res;
      }
    }
    // Refresh activity timestamp
    supabaseResponse.cookies.set('byg-last-activity', Date.now().toString(), {
      httpOnly: true,
      path: '/admin',
      maxAge: SESSION_TIMEOUT_MS / 1000,
      sameSite: 'lax',
    });
  }

  // Redirect unauthenticated users away from protected admin routes
  if (isAdminRoute && !isLoginPage && !user) {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login page
  if (isLoginPage && user) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  // Security headers for all admin routes
  supabaseResponse.headers.set('X-Frame-Options', 'DENY');
  supabaseResponse.headers.set('X-Content-Type-Options', 'nosniff');
  supabaseResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return supabaseResponse;
}

export const config = {
  matcher: ['/admin/:path*'],
};
