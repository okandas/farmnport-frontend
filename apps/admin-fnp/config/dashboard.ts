import { DashboardConfig } from "@/types"

export const dashboardConfig: DashboardConfig = {
  mainNavigation: [
    {
      title: "Documentation",
      href: "/docs",
    },
  ],
  sidebarNavigation: [
    {
      label: "Overview",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard/farmnport",
          icon: "dashboard",
        },
      ],
    },
    {
      label: "Sales",
      items: [
        {
          title: "Overview",
          href: "/dashboard/farmnport/sales",
          icon: "barChart",
        },
      ],
    },
    {
      label: "Orders",
      items: [
        {
          title: "Sales Orders",
          href: "/dashboard/farmnport/orders/sales",
          icon: "shoppingCart",
        },
        {
          title: "Bookings",
          href: "/dashboard/farmnport/orders/bookings",
          icon: "calender",
        },
        {
          title: "Booking Events",
          href: "/dashboard/farmnport/orders/booking-events",
          icon: "calender",
        },
        {
          title: "Delivery Locations",
          href: "/dashboard/farmnport/orders/delivery-locations",
          icon: "mapPin",
        },
      ],
    },
    {
      label: "Analytics",
      items: [
        {
          title: "Most Viewed Contacts",
          href: "/dashboard/farmnport/contact-views/most-viewed",
          icon: "eye",
        },
        {
          title: "Recent Views",
          href: "/dashboard/farmnport/analytics/recent-views",
          icon: "calender",
        },
        {
          title: "User Views",
          href: "/dashboard/farmnport/analytics/user-views",
          icon: "user",
        },
        {
          title: "Recent User Views",
          href: "/dashboard/farmnport/analytics/recent-user-views",
          icon: "calender",
        },
      ],
    },
    {
      label: "Management",
      items: [
        {
          title: "Users",
          href: "/dashboard/farmnport/users",
          icon: "user",
        },
        {
          title: "Administrators",
          href: "/dashboard/farmnport/admins",
          icon: "construction",
        },
        {
          title: "Buyer Contacts",
          href: "/dashboard/farmnport/buyer-contacts",
          icon: "badgeCheck",
        },
      ],
    },
    {
      label: "AgroChemicals",
      items: [
        {
          title: "Products",
          href: "/dashboard/farmnport/agrochemicals",
          icon: "productSearch",
        },
        {
          title: "Categories",
          href: "/dashboard/farmnport/agrochemical-categories",
          icon: "clipboardList",
        },
        {
          title: "Active Ingredients",
          href: "/dashboard/farmnport/agrochemical-active-ingredients",
          icon: "beaker",
        },
        {
          title: "Targets",
          href: "/dashboard/farmnport/agrochemical-targets",
          icon: "bug",
        },
      ],
    },
    {
      label: "Animal Health",
      items: [
        {
          title: "Products",
          href: "/dashboard/farmnport/animal-health-products",
          icon: "productSearch",
        },
        {
          title: "Categories",
          href: "/dashboard/farmnport/animal-health-categories",
          icon: "clipboardList",
        },
        {
          title: "Ingredients",
          href: "/dashboard/farmnport/animal-health-active-ingredients",
          icon: "beaker",
        },
        {
          title: "Targets",
          href: "/dashboard/farmnport/animal-health-targets",
          icon: "bug",
        },
      ],
    },
    {
      label: "Farm Produce",
      items: [
        {
          title: "Categories",
          href: "/dashboard/farmnport/farmproducecategories",
          icon: "tractor",
        },
        {
          title: "Products",
          href: "/dashboard/farmnport/farmproduce",
          icon: "package",
        },
        {
          title: "Crop Groups",
          href: "/dashboard/farmnport/crop-groups",
          icon: "layers",
        },
        {
          title: "Weed Groups",
          href: "/dashboard/farmnport/weed-groups",
          icon: "layers",
        },
        {
          title: "Brands",
          href: "/dashboard/farmnport/brands",
          icon: "tag",
        },
      ],
    },
    {
      label: "Feed",
      items: [
        {
          title: "Products",
          href: "/dashboard/farmnport/feed-products",
          icon: "productSearch",
        },
        {
          title: "Categories",
          href: "/dashboard/farmnport/feed-categories",
          icon: "clipboardList",
        },
        {
          title: "Ingredients",
          href: "/dashboard/farmnport/feed-active-ingredients",
          icon: "beaker",
        },
        {
          title: "Nutritional Specs",
          href: "/dashboard/farmnport/feed-nutritional-specs",
          icon: "fileSpreadsheet",
        },
        {
          title: "Targets",
          href: "/dashboard/farmnport/feed-targets",
          icon: "bug",
        },
      ],
    },
    {
      label: "Programs & Pricing",
      items: [
        {
          title: "Spray Programs",
          href: "/dashboard/farmnport/spray-programs",
          icon: "sprout",
        },
        {
          title: "Feeding Programs",
          href: "/dashboard/farmnport/feeding-programs",
          icon: "egg",
        },
        {
          title: "Producer Prices",
          href: "/dashboard/farmnport/prices",
          icon: "billing",
        },
        {
          title: "CDM Prices",
          href: "/dashboard/farmnport/cdm-prices",
          icon: "billing",
        },
      ],
    },
  ],
}
