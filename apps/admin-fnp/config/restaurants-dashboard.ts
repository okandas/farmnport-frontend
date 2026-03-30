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
          title: "Menus",
          href: "/dashboard/restaurants/menus",
          icon: "clipboardList",
        },
        {
          title: "Menu Items",
          href: "/dashboard/restaurants/menu-items",
          icon: "utensilsCrossed",
        },
        {
          title: "Categories",
          href: "/dashboard/restaurants/menu-item-categories",
          icon: "tag",
        },
        {
          title: "Add-Ons",
          href: "/dashboard/restaurants/menu-item-add-ons",
          icon: "sparkles",
        },
        {
          title: "Components",
          href: "/dashboard/restaurants/menu-item-components",
          icon: "egg",
        },
      ],
    },
  ],
}
