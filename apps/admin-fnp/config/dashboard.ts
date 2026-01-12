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
      title: "AgroChemicals",
      href: "/dashboard/agrochemicals",
      icon: "productSearch",
    },
    {
      title: "Farm Produce Categories",
      href: "/dashboard/farmproducecategories",
      icon: "tractor",
    },
    {
      title: "Farm Produce",
      href: "/dashboard/farmproduce",
      icon: "package",
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
