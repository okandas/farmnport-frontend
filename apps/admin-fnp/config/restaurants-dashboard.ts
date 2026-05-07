import { DashboardConfig } from "@/types"

export const restaurantsDashboardConfig: DashboardConfig = {
  mainNavigation: [],
  sidebarNavigation: [
    {
      label: "Overview",
      items: [
        {
          title: "Restaurants",
          href: "/dashboard/restaurants/all",
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
      label: "Analytics",
      alwaysOpen: true,
      items: [
        {
          title: "Contact Interactions",
          href: "/dashboard/restaurants/contact-views",
          icon: "eye",
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
      label: "Subscriptions",
      alwaysOpen: true,
      items: [
        {
          title: "Plans",
          href: "/dashboard/restaurants/subscription-plans",
          icon: "billing",
        },
        {
          title: "Subscriptions",
          href: "/dashboard/restaurants/subscriptions",
          icon: "layers",
        },
        {
          title: "Invoices",
          href: "/dashboard/restaurants/invoices",
          icon: "billing",
        },
      ],
    },
  ],
}
