import { NextRequest, NextResponse } from "next/server";

/* ============================================================
   ROUTE CONFIG
============================================================ */

const PROTECTED_ROUTES = [
  "/dashboard",
];

const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/register",
];

const AUTH_COOKIE_NAME = "accessToken";

/* ============================================================
   HELPERS
============================================================ */

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );
}

function getIsAuthenticated(
  request: NextRequest
): boolean {
  const token = request.cookies.get(
    AUTH_COOKIE_NAME
  )?.value;

  return Boolean(token && token.trim());
}

/* ============================================================
   MIDDLEWARE
============================================================ */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthenticated =
    getIsAuthenticated(request);

  if (process.env.NODE_ENV !== "production") {
    console.log(
      "[MIDDLEWARE]",
      pathname,
      "authenticated:",
      isAuthenticated
    );
  }

  /* ==========================================================
     PROTECTED DASHBOARD ROUTES
  ========================================================== */

  if (isProtectedRoute(pathname)) {
    if (!isAuthenticated) {
      const loginUrl = new URL(
        "/login",
        request.url
      );

      // e.g. /dashboard/jobs -> /login?redirect=%2Fdashboard%2Fjobs
      loginUrl.searchParams.set(
        "redirect",
        pathname
      );

      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  /* ==========================================================
     LOGIN / SIGNUP / REGISTER
  ========================================================== */

  if (isAuthRoute(pathname)) {
    if (isAuthenticated) {
      return NextResponse.redirect(
        new URL("/dashboard", request.url)
      );
    }

    return NextResponse.next();
  }

  /* ==========================================================
     DEFAULT
  ========================================================== */

  return NextResponse.next();
}

/* ============================================================
   MATCHER
============================================================ */

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/signup",
    "/register",
  ],
};