"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/hooks/useAuth";

export default function AdminRouteGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/auth/login");
      return;
    }
    if (user.role !== "super_admin") {
      // Send to their correct area
      if (user.role === "organization_admin") {
        router.replace(`/org/${user.orgname ?? "dashboard"}/dashboard`);
      } else {
        router.replace(`/${user.username}/dashboard`);
      }
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user || user.role !== "super_admin") return null;

  return <>{children}</>;
}
