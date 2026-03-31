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
        {
          title: "Cuisine Categories",
          href: "/dashboard/restaurants/cuisine-categories",
          icon: "tag",
        },
      ],
    },
    {
      label: "Sales",
      items: [
        {
          title: "Overview",
          href: "/dashboard/restaurants/sales",
          icon: "barChart",
        },
        {
          title: "Orders",
          href: "/dashboard/restaurants/sales/orders",
          icon: "shoppingCart",
        },
      ],
    },
    {
      label: "Menu Catalog",
      items: [
        {
          title: "Menu Categories",
          href: "/dashboard/restaurants/menu-categories",
          icon: "layers",
        },
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
