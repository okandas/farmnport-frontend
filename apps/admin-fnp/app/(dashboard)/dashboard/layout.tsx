import { dashboardConfig } from "@/config/dashboard"
import { AccountNavigation } from "@/components/navigation/account"
import { MainNavigation } from "@/components/navigation/main"
import { SidebarNavigation } from "@/components/navigation/sidebar"

interface DashboardLayoutProps {
  children?: React.ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen space-y-6">
      <header className="sticky top-0 z-40 border-b shadow-sm bg-background">
        <div className="container flex items-center justify-between h-16 py-4">
          <MainNavigation />
          <AccountNavigation />
        </div>
      </header>
      <div className="container flex flex-1 gap-12">
        <aside className="fixed hidden h-screen w-[200px] flex-col border-r px-4 md:flex">
          <SidebarNavigation
            navigationLinks={dashboardConfig.sidebarNavigation}
          />
        </aside>
        <main className="flex flex-col flex-1 overflow-hidden sm:ml-64">
          {children}
        </main>
      </div>
    </div>
  )
}
