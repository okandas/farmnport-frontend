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
      title: "AgroChemical Categories",
      href: "/dashboard/agrochemical-categories",
      icon: "clipboardList",
    },
    {
      title: "AgroChemical Active Ingredients",
      href: "/dashboard/agrochemical-active-ingredients",
      icon: "beaker",
    },
    {
      title: "AgroChemical Targets",
      href: "/dashboard/agrochemical-targets",
      icon: "bug",
    },
    {
      title: "Brands",
      href: "/dashboard/brands",
      icon: "tag",
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
