"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/shared/hooks/useAuth";

/**
 * Client-side guard for /{username}/... routes.
 * Middleware handles server-side redirection; this provides a safety net
 * for client navigation and double-checks the username matches.
 */
export default function UserRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const usernameInUrl = params["username"] as string;

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/auth/login");
      return;
    }
    // Org admins and super admins should not be on user routes
    if (user.role === "organization_admin") {
      router.replace(`/org/${user.organizationId ?? "dashboard"}/dashboard`);
      return;
    }
    if (user.role === "super_admin") {
      router.replace("/admin/dashboard");
      return;
    }
    // Ensure the username in the URL matches the logged-in user
    if (usernameInUrl && user.username && usernameInUrl !== user.username) {
      router.replace(`/${user.username}/dashboard`);
    }
  }, [isAuthenticated, user, router, usernameInUrl]);

  if (!isAuthenticated || !user) return null;

  return <>{children}</>;
}
