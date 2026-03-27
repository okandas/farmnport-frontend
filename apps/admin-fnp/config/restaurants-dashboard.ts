import { DashboardConfig } from "@/types"

export const restaurantsDashboardConfig: DashboardConfig = {
  mainNavigation: [],
  sidebarNavigation: [
    {
      label: "Overview",
      items: [
        {
          title: "Restaurants",
          href: "/dashboard/restaurants",
          icon: "dashboard",
        },
        {
          title: "Locations",
          href: "/dashboard/restaurants/locations",
          icon: "layers",
        },
      ],
    },
    {
      label: "Menu Catalog",
      items: [
        {
          title: "Categories",
          href: "/dashboard/restaurants/menu-item-categories",
          icon: "layers",
        },
        {
          title: "Components",
          href: "/dashboard/restaurants/menu-item-components",
          icon: "layers",
        },
        {
          title: "Menu Items",
          href: "/dashboard/restaurants/menu-items",
          icon: "layers",
        },
      ],
    },
  ],
}
