import { DashboardConfig } from "@/types"

export const chefsDashboardConfig: DashboardConfig = {
  mainNavigation: [],
  sidebarNavigation: [
    {
      label: "Overview",
      items: [
        {
          title: "Chefs",
          href: "/dashboard/chefs",
          icon: "chefHat",
        },
        {
          title: "Menus",
          href: "/dashboard/chefs/menus",
          icon: "clipboardList",
        },
        {
          title: "Menu Items",
          href: "/dashboard/chefs/menu-items",
          icon: "utensilsCrossed",
        },
        {
          title: "Bookings",
          href: "/dashboard/chefs/bookings",
          icon: "calendarCheck",
        },
        {
          title: "Subscriptions",
          href: "/dashboard/chefs/subscriptions",
          icon: "layers",
        },
        {
          title: "Payouts",
          href: "/dashboard/chefs/payouts",
          icon: "wallet",
        },
      ],
    },
  ],
}
