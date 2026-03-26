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
  ],
}
