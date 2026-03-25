import { DashboardConfig } from "@/types"

export const menusDashboardConfig: DashboardConfig = {
  mainNavigation: [],
  sidebarNavigation: [
    {
      label: "Overview",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard/menus",
          icon: "dashboard",
        },
      ],
    },
  ],
}
