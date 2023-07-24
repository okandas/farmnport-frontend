import { DashboardConfig } from "@/types"

export const dashboardConfig: DashboardConfig = {
  mainNavigation: [
    {
      title: "Documentation",
      href: "/docs",
    },
  ],
  sidebarNavigation: [
    {
      title: "Users",
      href: "/dashboard/users",
      icon: "user",
    },
    {
      title: "Administrators",
      href: "/dashboard/admins",
      icon: "user",
    },
  ],
}
