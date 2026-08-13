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
      ],
    },
    {
      label: "Listings",
      alwaysOpen: true,
      items: [
        {
          title: "All Listings",
          href: "/dashboard/chefs/listings",
          icon: "clipboardList",
        },
        {
          title: "New Listing",
          href: "/dashboard/chefs/listings/new",
          icon: "add",
        },
      ],
    },
    {
      label: "Bookings & Subscriptions",
      alwaysOpen: true,
      items: [
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
      ],
    },
    {
      label: "Finance",
      alwaysOpen: true,
      items: [
        {
          title: "Payouts",
          href: "/dashboard/chefs/payouts",
          icon: "wallet",
        },
      ],
    },
  ],
}
