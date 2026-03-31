import UserRouteGuard from "@/shared/layouts/user/UserRouteGuard";
import UserSidebar from "@/shared/layouts/user/UserSidebar";
import UserTopbar from "@/shared/layouts/user/UserTopbar";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserRouteGuard>
      <div className="flex h-dvh bg-gray-50 overflow-hidden">
        <UserSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <UserTopbar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </UserRouteGuard>
  );
}
