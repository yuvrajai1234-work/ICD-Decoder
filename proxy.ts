import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  try {
    // Gracefully handle missing env vars
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.next();
    }

    // Dynamic import to prevent edge runtime issues
    const { createServerClient } = await import("@supabase/ssr");

    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Protected routes
    const protectedPaths = ["/predict", "/review", "/audit"];
    const isProtected = protectedPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path)
    );

    if (isProtected && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      return NextResponse.redirect(url);
    }

    // Redirect signed-in users away from auth pages
    const authPaths = ["/sign-in", "/sign-up"];
    const isAuthPage = authPaths.some((path) =>
      request.nextUrl.pathname.startsWith(path)
    );

    if (isAuthPage && user) {
      const url = request.nextUrl.clone();
      url.pathname = "/predict";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (e) {
    // Never crash the proxy — let the request through on any error
    console.error("Proxy error:", e);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
