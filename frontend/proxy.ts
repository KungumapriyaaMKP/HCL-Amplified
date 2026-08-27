import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 Proxy.
 * Refreshes active Supabase session and gates protected routes (/roadmap, /analytics)
 * when Supabase is configured. In guest fallback mode (unconfigured), browsing is unrestricted.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // If Supabase is unconfigured, allow full guest browsing
  if (!url || !key) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // Check authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isGated =
    pathname.startsWith("/roadmap") ||
    pathname.startsWith("/analytics");

  if (!user && isGated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Onboarding status gating for authenticated users
  if (user) {
    const status = user.user_metadata?.onboarding_status;
    const isCompleted = !status || status === "completed";
    const isOnboarding = pathname.startsWith("/onboarding");
    const isAuth = pathname.startsWith("/login") || pathname.startsWith("/signup");
    const isApi = pathname.startsWith("/api");

    // If completed or legacy account, re-entering onboarding routes or visiting "/" directly routes to roadmap
    if (isCompleted && (isOnboarding || pathname === "/")) {
      const roadmapUrl = request.nextUrl.clone();
      roadmapUrl.pathname = "/roadmap";
      return NextResponse.redirect(roadmapUrl);
    }

    // If onboarding is in-progress and user navigates to app routes, guide them to current step
    if (!isCompleted && !isOnboarding && !isAuth && !isApi) {
      const stepMap: Record<string, string> = {
        history_pending: "/onboarding/history",
        discovery_pending: "/onboarding/discovery",
        role_pending: "/onboarding/role",
        diagnostic_pending: "/onboarding/diagnostic",
      };
      const targetStep = (status && stepMap[status]) || "/onboarding/history";
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = targetStep;
      return NextResponse.redirect(redirectUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
