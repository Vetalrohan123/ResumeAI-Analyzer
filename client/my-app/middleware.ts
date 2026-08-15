import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
];

const AUTH_ROUTES = [
  "/login",
  "/signup",
];

function isProtectedRoute(
  pathname: string
): boolean {
  return PROTECTED_ROUTES.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(
        `${route}/`
      )
  );
}

/* ============================================================
   CHECK AUTH ROUTE
============================================================ */

function isAuthRoute(
  pathname: string
): boolean {
  return AUTH_ROUTES.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(
        `${route}/`
      )
  );
}

/* ============================================================
   MIDDLEWARE
============================================================ */

export function middleware(
  request: NextRequest
) {
  const { pathname } =
    request.nextUrl;

  /* ==========================================================
     ACCESS TOKEN COOKIE
  ========================================================== */

  const accessToken =
    request.cookies.get(
      "accessToken"
    )?.value;

  const isAuthenticated =
    Boolean(
      accessToken &&
        accessToken.trim()
    );

  /* ==========================================================
     DEBUG
  ========================================================== */

  console.log(
    "[MIDDLEWARE]",
    pathname,
    "authenticated:",
    isAuthenticated
  );

  /* ==========================================================
     PROTECTED DASHBOARD ROUTES
  ========================================================== */

  if (
    isProtectedRoute(pathname)
  ) {
    if (!isAuthenticated) {
      const loginUrl =
        new URL(
          "/login",
          request.url
        );

      /*
       * Example:
       *
       * /dashboard/jobs
       *
       * becomes:
       *
       * /login?redirect=%2Fdashboard%2Fjobs
       */

      loginUrl.searchParams.set(
        "redirect",
        pathname
      );

      return NextResponse.redirect(
        loginUrl
      );
    }
  }

  /* ==========================================================
     LOGIN / SIGNUP
  ========================================================== */

  if (
    isAuthRoute(pathname)
  ) {
    if (isAuthenticated) {
      return NextResponse.redirect(
        new URL(
          "/dashboard",
          request.url
        )
      );
    }
  }

  /* ==========================================================
     ALLOW REQUEST
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
  ],
};