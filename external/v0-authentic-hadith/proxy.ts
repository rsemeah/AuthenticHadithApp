import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/pricing",
  "/checkout/success",
  "/reset-password",
];

// Paths that start with these prefixes are public
const PUBLIC_PREFIXES = ["/api/", "/auth/", "/admin/"];

// Protected paths that require authentication
const PROTECTED_PREFIXES = [
  "/home",
  "/dashboard",
  "/onboarding",
  "/profile",
  "/settings",
  "/saved",
  "/collections",
  "/hadith",
  "/assistant",
  "/search",
  "/learn",
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix)))
    return true;
  return false;
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  try {
    const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({
            request,
          });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;
    const hasOnboarded = request.cookies.get("qbos_onboarded")?.value === "1";

    // Protect authenticated routes - redirect to login if not authenticated
    if (!user && isProtectedPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Redirect authenticated users from /login to /home (or /onboarding)
    if (user && pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = hasOnboarded ? "/home" : "/onboarding";
      return NextResponse.redirect(url);
    }

    // Redirect to onboarding if authenticated but not onboarded (except for allowed paths)
    if (
      user &&
      !hasOnboarded &&
      isProtectedPath(pathname) &&
      pathname !== "/onboarding"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/onboarding";
      return NextResponse.redirect(url);
    }
  } catch (err) {
    console.error("[v0] Proxy error:", err);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
