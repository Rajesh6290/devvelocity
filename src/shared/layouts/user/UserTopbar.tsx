"use client";

import { useAuth } from "@/shared/hooks/useAuth";
import { Bell, ChevronDown } from "lucide-react";
import Image from "next/image";

export default function UserTopbar() {
  const { user } = useAuth();

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
      <div />
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
          <Bell className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-sm font-bold">
            {user?.email?.[0]?.toUpperCase() ?? "U"}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block">
            {user?.email?.split("@")[0]}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </header>
  );
}
