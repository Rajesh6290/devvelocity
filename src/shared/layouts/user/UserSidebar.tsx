"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useParams } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  Mic2,
  Briefcase,
  MapPin,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import useMutation from "@/shared/hooks/useMutation";
import { removeFromLocalStorage } from "@/shared/utils";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", slug: "dashboard", icon: LayoutDashboard },
  { label: "Resume", slug: "resume", icon: FileText },
  { label: "Skill Gap", slug: "skill-gap", icon: BarChart3 },
  { label: "Learning", slug: "learning", icon: BookOpen },
  { label: "Assessments", slug: "assessments", icon: ClipboardCheck },
  { label: "Interview", slug: "interview", icon: Mic2 },
  { label: "Job Readiness", slug: "job-readiness", icon: MapPin },
  { label: "Jobs", slug: "jobs", icon: Briefcase },
  { label: "Settings", slug: "settings", icon: Settings },
];

export default function UserSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const params = useParams();
  const username = params["username"] as string;
  const router = useRouter();
  const { mutation } = useMutation();

  const handleLogout = async () => {
    await mutation("auth/logout", { method: "POST" });
    removeFromLocalStorage("ACCESS_TOKEN");
    router.push("/auth/login");
  };

  return (
    <aside
      className={`flex flex-col bg-white border-r border-gray-100 h-full transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 min-h-16">
        {!collapsed && (
          <Link href={`/${username}/dashboard`}>
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
          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-brand hover:border-brand transition-colors ml-auto"
          aria-label="Toggle sidebar"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {NAV_ITEMS.map((item) => {
          const href = `/${username}/${item.slug}`;
          const Icon = item.icon;
          const active =
            item.slug === "dashboard"
              ? pathname === `/${username}/dashboard`
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

      {/* Logout */}
      <div className="border-t border-gray-100 p-2">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
