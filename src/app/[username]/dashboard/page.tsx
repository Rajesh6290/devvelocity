import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default function UserDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
      <p className="text-gray-500 text-sm">
        Welcome back. Here is your career progress.
      </p>
    </div>
  );
}
