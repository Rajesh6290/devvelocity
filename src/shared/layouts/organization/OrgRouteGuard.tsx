"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/shared/hooks/useAuth";

export default function OrgRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const orgnameInUrl = params["orgname"] as string;

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/auth/login");
      return;
    }
    if (
      user.role !== "organization_admin" &&
      user.role !== "organization_student"
    ) {
      // Wrong role — send to their correct dashboard
      if (user.role === "super_admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace(`/${user.username}/dashboard`);
      }
      return;
    }
    // Verify orgname matches token
    if (orgnameInUrl && user.orgname && orgnameInUrl !== user.orgname) {
      router.replace(`/org/${user.orgname}/dashboard`);
    }
  }, [isAuthenticated, user, router, orgnameInUrl]);

  if (!isAuthenticated || !user) return null;

  return <>{children}</>;
}
