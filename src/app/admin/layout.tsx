import AdminRouteGuard from "@/shared/layouts/admin/AdminRouteGuard";
import AdminSidebar from "@/shared/layouts/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRouteGuard>
      <div className="flex h-dvh bg-gray-50 overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-14 bg-white border-b border-gray-100 flex items-center px-6 sticky top-0 z-30">
            <span className="text-sm font-semibold text-gray-500">
              Admin Panel
            </span>
            <div className="ml-auto flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-white text-sm font-bold">
                A
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AdminRouteGuard>
  );
}
