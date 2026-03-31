import OrgRouteGuard from "@/shared/layouts/organization/OrgRouteGuard";
import OrgSidebar from "@/shared/layouts/organization/OrgSidebar";

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return (
    <OrgRouteGuard>
      <div className="flex h-dvh bg-gray-50 overflow-hidden">
        <OrgSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-14 bg-white border-b border-gray-100 flex items-center px-6 sticky top-0 z-30">
            <div className="ml-auto flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-white text-sm font-bold">
                O
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </OrgRouteGuard>
  );
}
