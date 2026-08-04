import { DashboardConfig } from "@/types"

export const turtlewaxDashboardConfig: DashboardConfig = {
  mainNavigation: [],
  sidebarNavigation: [
    {
      label: "Overview",
      items: [
        {
          title: "Categories",
          href: "/dashboard/turtlewax/categories",
          icon: "clipboardList",
        },
        {
          title: "Products",
          href: "/dashboard/turtlewax/products",
          icon: "productSearch",
        },
      ],
    },
  ],
}
