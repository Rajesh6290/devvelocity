"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useParams } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  CreditCard,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Building2,
} from "lucide-react";
import useMutation from "@/shared/hooks/useMutation";
import { removeFromLocalStorage } from "@/shared/utils";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", slug: "dashboard", icon: LayoutDashboard },
  { label: "Students", slug: "students", icon: Users },
  { label: "Analytics", slug: "analytics", icon: BarChart3 },
  { label: "Billing", slug: "billing", icon: CreditCard },
  { label: "Settings", slug: "settings", icon: Settings },
];

export default function OrgSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const orgname = params["orgname"] as string;
  const router = useRouter();
  const { mutation } = useMutation();

  const handleLogout = async () => {
    await mutation("auth/logout", { method: "POST" });
    removeFromLocalStorage("ACCESS_TOKEN");
    router.push("/auth/login");
  };

  return (
    <aside
      className={`flex flex-col bg-white border-r border-gray-100 h-full transition-all duration-300 shrink-0 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 min-h-16">
        {!collapsed && (
          <Link href={`/org/${orgname}/dashboard`}>
            <Image
              src="/logo.svg"
              alt="DevVelocity"
              width={130}
              height={32}
              priority
            />
          </Link>
        )}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-brand hover:border-brand transition-colors ml-auto shrink-0"
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Org badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider truncate">
              {orgname}
            </span>
          </div>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {NAV_ITEMS.map((item) => {
          const href = `/org/${orgname}/${item.slug}`;
          const Icon = item.icon;
          const active =
            item.slug === "dashboard"
              ? pathname === `/org/${orgname}/dashboard`
              : pathname.startsWith(href);
          return (
            <Link
              key={item.slug}
              href={href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-50 text-brand"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${active ? "text-brand" : "text-gray-400"}`}
              />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 p-2">
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
