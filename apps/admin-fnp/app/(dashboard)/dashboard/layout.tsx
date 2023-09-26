import { dashboardConfig } from "@/config/dashboard";
import { AdminAccountNavigation } from "@/components/navigation/admin-account";
import { MainNavigation } from "@/components/navigation/main";
import { SidebarNavigation } from "@/components/navigation/sidebar";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <header className="sticky top-0 z-40 border-b bg-background shadow-sm">
        <div className="container flex h-16 items-center justify-between py-4">
          <MainNavigation />
          <AdminAccountNavigation />
        </div>
      </header>
      <div className="container flex flex-1 gap-12">
        <aside className="hidden w-[200px] flex-col md:flex border-r px-4 fixed h-screen">
          <SidebarNavigation
            navigationLinks={dashboardConfig.sidebarNavigation}
          />
        </aside>
        <main className="flex flex-1 flex-col overflow-hidden sm:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}
