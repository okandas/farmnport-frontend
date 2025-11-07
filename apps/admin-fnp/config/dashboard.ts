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
      title: "Products",
      href: "/dashboard/products",
      icon: "productSearch",
    },
    {
      title: "Producer Prices",
      href: "/dashboard/prices",
      icon: "billing",
    },
    {
      title: "Agricultural Produce",
      href: "/dashboard/produce",
      icon: "wheat",
    },
    {
      title: "Administrators",
      href: "/dashboard/admins",
      icon: "construction",
    },
  ],
}
