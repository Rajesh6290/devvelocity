"use client";

import { useAuth } from "./useAuth";
import type { UserRole } from "@/shared/types";

type PlanType = "trial" | "plus" | "pro" | "unlimited" | "organization";
type SubscriptionStatus = "active" | "expired" | "cancelled" | "trial";

export interface PermissionOptions {
  roles?: UserRole[];
  plans?: PlanType[];
  requireActiveSubscription?: boolean;
}

export interface PermissionResult {
  canAccess: boolean;
  reason:
    | "ok"
    | "unauthenticated"
    | "forbidden_role"
    | "plan_required"
    | "subscription_expired";
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  hasPlan: (plan: PlanType) => boolean;
  isSubscriptionActive: boolean;
}

export function usePermission(
  options: PermissionOptions = {}
): PermissionResult {
  const { user, isAuthenticated } = useAuth();

  const hasRole = (role: UserRole): boolean => user?.role === role;

  const hasPlan = (plan: PlanType): boolean => user?.planType === plan;

  const isSubscriptionActive =
    isAuthenticated &&
    (user?.subscriptionStatus === "active" ||
      user?.subscriptionStatus === "trial");

  if (!isAuthenticated || !user) {
    return {
      canAccess: false,
      reason: "unauthenticated",
      isAuthenticated: false,
      hasRole,
      hasPlan,
      isSubscriptionActive: false,
    };
  }

  // Role check
  if (options.roles && options.roles.length > 0) {
    if (!options.roles.includes(user.role)) {
      return {
        canAccess: false,
        reason: "forbidden_role",
        isAuthenticated: true,
        hasRole,
        hasPlan,
        isSubscriptionActive,
      };
    }
  }

  // Subscription check
  if (options.requireActiveSubscription && !isSubscriptionActive) {
    return {
      canAccess: false,
      reason: "subscription_expired",
      isAuthenticated: true,
      hasRole,
      hasPlan,
      isSubscriptionActive,
    };
  }

  // Plan check
  if (options.plans && options.plans.length > 0) {
    const planHierarchy: Record<PlanType, number> = {
      trial: 0,
      plus: 1,
      pro: 2,
      unlimited: 3,
      organization: 1,
    };
    const userLevel = planHierarchy[user.planType as PlanType] ?? -1;
    const minRequired = Math.min(
      ...options.plans.map((p) => planHierarchy[p] ?? 999)
    );
    if (userLevel < minRequired) {
      return {
        canAccess: false,
        reason: "plan_required",
        isAuthenticated: true,
        hasRole,
        hasPlan,
        isSubscriptionActive,
      };
    }
  }

  return {
    canAccess: true,
    reason: "ok",
    isAuthenticated: true,
    hasRole,
    hasPlan,
    isSubscriptionActive,
  };
}
