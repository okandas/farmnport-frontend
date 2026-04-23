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
    {
      label: "Restaurants",
      alwaysOpen: true,
      items: [
        {
          title: "Restaurants",
          href: "/dashboard/restaurants",
          icon: "utensilsCrossed",
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
      label: "Menu Catalog",
      alwaysOpen: true,
      items: [
        {
          title: "Menu Categories",
          href: "/dashboard/restaurants/menu-item-categories",
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
    {
      label: "Analytics",
      alwaysOpen: true,
      items: [
        {
          title: "Contact Interactions",
          href: "/dashboard/menus/contact-views",
          icon: "eye",
        },
      ],
    },
  ],
}
