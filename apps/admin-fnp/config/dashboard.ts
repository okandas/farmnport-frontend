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
      title: "Producer Prices",
      href: "/dashboard/prices",
      icon: "billing",
    },
    {
      title: "Administrators",
      href: "/dashboard/admins",
      icon: "construction",
    },
  ],
}
