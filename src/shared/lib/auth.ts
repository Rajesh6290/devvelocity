import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "./serverEnv";
import type { UserRole } from "@/shared/types";

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  planType: string;
  subscriptionStatus: string;
  organizationId?: string;
  /** URL-safe lowercase slug derived from user's name, used in /{username}/... routes */
  username: string;
  /** URL-safe org slug used in /org/{orgname}/... routes */
  orgname?: string;
}

// ── Token utilities ───────────────────────────────────────────────────────────

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "15m" });
}

export function signRefreshToken(payload: Pick<JwtPayload, "userId">): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "30d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as JwtPayload;
  } catch {
    return null;
  }
}

// ── Request token extractor ───────────────────────────────────────────────────

export function extractTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  const cookie = req.cookies.get("access_token");
  return cookie?.value ?? null;
}

// ── Auth guard ────────────────────────────────────────────────────────────────

export function requireAuth(
  req: NextRequest
): { payload: JwtPayload } | NextResponse {
  const token = extractTokenFromRequest(req);
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }
  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { success: false, message: "Invalid or expired token" },
      { status: 401 }
    );
  }
  return { payload };
}

// ── Role guard ────────────────────────────────────────────────────────────────

export function requireRole(
  req: NextRequest,
  ...roles: UserRole[]
): { payload: JwtPayload } | NextResponse {
  const result = requireAuth(req);
  if (result instanceof NextResponse) return result;
  if (!roles.includes(result.payload.role)) {
    return NextResponse.json(
      { success: false, message: "Forbidden: insufficient permissions" },
      { status: 403 }
    );
  }
  return result;
}

// ── Subscription guard ────────────────────────────────────────────────────────

export function requireActiveSubscription(
  req: NextRequest
): { payload: JwtPayload } | NextResponse {
  const result = requireAuth(req);
  if (result instanceof NextResponse) return result;
  const { subscriptionStatus } = result.payload;
  if (subscriptionStatus !== "active" && subscriptionStatus !== "trial") {
    return NextResponse.json(
      {
        success: false,
        message: "Subscription required. Please upgrade your plan.",
        code: "SUBSCRIPTION_EXPIRED",
      },
      { status: 402 }
    );
  }
  return result;
}

// ── Cookie helpers ────────────────────────────────────────────────────────────

export function setAuthCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): NextResponse {
  response.cookies.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax",
    maxAge: 15 * 60, // 15 min
    path: "/",
  });
  response.cookies.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });
  return response;
}

export function clearAuthCookies(response: NextResponse): NextResponse {
  response.cookies.set("access_token", "", { maxAge: 0, path: "/" });
  response.cookies.set("refresh_token", "", { maxAge: 0, path: "/" });
  return response;
}
