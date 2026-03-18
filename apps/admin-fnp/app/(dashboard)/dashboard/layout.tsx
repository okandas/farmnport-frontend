import { dashboardConfig } from "@/config/dashboard"
import { AccountNavigation } from "@/components/navigation/account"
import { MainNavigation } from "@/components/navigation/main"
import { SidebarNavigation } from "@/components/navigation/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DashboardLayoutProps {
  children?: React.ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-40 border-b shadow-sm bg-background">
        <div className="container flex items-center justify-between h-16 py-4">
          <MainNavigation />
          <AccountNavigation />
        </div>
      </header>
      <div className="max-w-full flex flex-1 px-8">
        <aside className="fixed top-16 hidden h-[calc(100vh-4rem)] w-[220px] flex-col border-r md:flex">
          <ScrollArea className="flex-1 px-4 py-4">
            <SidebarNavigation
              navigationGroups={dashboardConfig.sidebarNavigation}
            />
          </ScrollArea>
        </aside>
        <main className="flex flex-col flex-1 overflow-hidden sm:ml-[236px] py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
