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
          title: "Listings",
          href: "/dashboard/chefs/listings",
          icon: "clipboardList",
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
