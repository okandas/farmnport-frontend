import { DashboardConfig } from "@/types"

export const tumiraDashboardConfig: DashboardConfig = {
  mainNavigation: [],
  sidebarNavigation: [
    {
      label: "Overview",
      alwaysOpen: true,
      items: [
        {
          title: "Dashboard",
          href: "/dashboard/tumira",
          icon: "dashboard",
        },
      ],
    },
    {
      label: "Couriers",
      alwaysOpen: true,
      items: [
        {
          title: "Couriers",
          href: "/dashboard/tumira/couriers",
          icon: "send",
        },
        {
          title: "Courier Rates",
          href: "/dashboard/tumira/courier-rates",
          icon: "billing",
        },
      ],
    },
    {
      label: "Network",
      alwaysOpen: true,
      items: [
        {
          title: "Collection Points",
          href: "/dashboard/tumira/delivery-points",
          icon: "layers",
        },
        {
          title: "Wards",
          href: "/dashboard/tumira/wards",
          icon: "mapPin",
        },
      ],
    },
    {
      label: "Codes",
      alwaysOpen: true,
      items: [
        {
          title: "Vanity Codes",
          href: "/dashboard/tumira/vanity-codes",
          icon: "sparkles",
        },
      ],
    },
  ],
}
