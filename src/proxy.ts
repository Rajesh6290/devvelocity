import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/shared/lib/auth";

// Routes that are always public — skip auth checks
const PUBLIC_PREFIXES = [
  "/api/public/",
  "/api/auth/",
  "/_next/",
  "/favicon.ico",
  "/logo.svg",
  "/og-image.png",
];

// Auth pages — redirect OUT if already logged in
const AUTH_PAGES = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.some((p) => pathname.startsWith(p));
}

function getDashboardUrl(
  role: string,
  username: string,
  orgname?: string
): string {
  if (role === "super_admin") return "/admin/dashboard";
  if (role === "organization_admin" && orgname)
    return `/org/${orgname}/dashboard`;
  return `/${username}/dashboard`;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths
  if (isPublicPath(pathname)) return NextResponse.next();

  const token =
    req.cookies.get("access_token")?.value ??
    req.headers.get("authorization")?.replace("Bearer ", "");

  const payload = token ? verifyToken(token) : null;

  // ── If on an auth page ──────────────────────────────────────────────────
  if (isAuthPage(pathname)) {
    if (payload) {
      // Already logged in → redirect to their dashboard
      const redirectUrl = getDashboardUrl(
        payload.role,
        payload.username ?? payload.email.split("@")[0],
        payload.orgname
      );
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
    return NextResponse.next();
  }

  // ── Admin routes ────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!payload) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    if (payload.role !== "super_admin") {
      return NextResponse.redirect(
        new URL("/auth/login?error=forbidden", req.url)
      );
    }
    return NextResponse.next();
  }

  // ── Organization routes: /org/[orgname]/... ─────────────────────────────
  if (pathname.startsWith("/org/")) {
    if (!payload) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    if (
      payload.role !== "organization_admin" &&
      payload.role !== "organization_student"
    ) {
      return NextResponse.redirect(
        new URL("/auth/login?error=forbidden", req.url)
      );
    }
    // Verify the orgname in the URL matches the token's org
    const segments = pathname.split("/"); // ["", "org", "orgname", ...]
    const orgnameInUrl = segments[2];
    if (payload.orgname && orgnameInUrl && orgnameInUrl !== payload.orgname) {
      return NextResponse.redirect(
        new URL(`/org/${payload.orgname}/dashboard`, req.url)
      );
    }
    return NextResponse.next();
  }

  // ── User routes: /[username]/... ────────────────────────────────────────
  // Detect if this is a user route by checking the first segment
  const firstSegment = pathname.split("/")[1];
  const knownStaticPrefixes = [
    "api",
    "auth",
    "admin",
    "org",
    "pricing",
    "contact",
    "about",
    "_next",
    "favicon.ico",
    "logo.svg",
  ];

  if (firstSegment && !knownStaticPrefixes.includes(firstSegment)) {
    if (!payload) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    // Only individual and org_student users use /[username]/ routes
    if (
      payload.role !== "individual" &&
      payload.role !== "organization_student"
    ) {
      // Admins/org-admins go to their own dashboards
      const redirectUrl = getDashboardUrl(
        payload.role,
        payload.username ?? payload.email.split("@")[0],
        payload.orgname
      );
      return NextResponse.redirect(new URL(redirectUrl, req.url));
    }
    // Verify the username in URL matches token
    const usernameInUrl = firstSegment;
    const actualUsername = payload.username ?? payload.email.split("@")[0];
    if (usernameInUrl !== actualUsername) {
      return NextResponse.redirect(
        new URL(`/${actualUsername}/dashboard`, req.url)
      );
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.svg|og-image.png).*)",
  ],
};
