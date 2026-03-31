"use client";

import { getFromLocalStorage } from "@/shared/utils";
import type { UserRole } from "@/shared/types";

export interface AuthUser {
  userId: string;
  name?: string;
  email: string;
  role: UserRole;
  planType: string;
  subscriptionStatus: string;
  organizationId?: string;
  /** URL-safe slug for /{username}/... routes */
  username?: string;
  /** URL-safe org slug for /org/{orgname}/... routes */
  orgname?: string;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isTokenExpired(payload: Record<string, unknown>): boolean {
  const exp = payload["exp"];
  if (typeof exp !== "number") return true;
  return Date.now() >= exp * 1000;
}

export function useAuth(): {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: false;
} {
  const user = ((): AuthUser | null => {
    const token = getFromLocalStorage("ACCESS_TOKEN");
    if (!token) return null;

    const payload = decodeJwtPayload(token);
    if (!payload || isTokenExpired(payload)) {
      return null;
    }

    return {
      userId: String(payload["userId"] ?? ""),
      email: String(payload["email"] ?? ""),
      role: (payload["role"] as UserRole) ?? "individual",
      planType: String(payload["planType"] ?? "trial"),
      subscriptionStatus: String(payload["subscriptionStatus"] ?? "trial"),
      organizationId: payload["organizationId"]
        ? String(payload["organizationId"])
        : undefined,
      username: String(payload["username"] ?? payload["email"] ?? "")
        .split("@")[0]
        .toLowerCase(),
      orgname: payload["orgname"] ? String(payload["orgname"]) : undefined,
    };
  })();

  return {
    user,
    isAuthenticated: user !== null,
    isLoading: false,
  };
}
