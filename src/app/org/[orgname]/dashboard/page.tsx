import type { Metadata } from "next";

export const metadata: Metadata = { title: "Organization Dashboard" };

export default function OrgDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Organization Dashboard
      </h1>
      <p className="text-gray-500 text-sm">
        Track your students placement readiness.
      </p>
    </div>
  );
}
