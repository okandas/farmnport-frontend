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
          href: "/dashboard",
          icon: "dashboard",
        },
      ],
    },
    {
      label: "Management",
      items: [
        {
          title: "Users",
          href: "/dashboard/users",
          icon: "user",
        },
        {
          title: "Administrators",
          href: "/dashboard/admins",
          icon: "construction",
        },
        {
          title: "Buyer Contacts",
          href: "/dashboard/buyer-contacts",
          icon: "badgeCheck",
        },
      ],
    },
    {
      label: "AgroChemicals",
      items: [
        {
          title: "Products",
          href: "/dashboard/agrochemicals",
          icon: "productSearch",
        },
        {
          title: "Categories",
          href: "/dashboard/agrochemical-categories",
          icon: "clipboardList",
        },
        {
          title: "Active Ingredients",
          href: "/dashboard/agrochemical-active-ingredients",
          icon: "beaker",
        },
        {
          title: "Targets",
          href: "/dashboard/agrochemical-targets",
          icon: "bug",
        },
      ],
    },
    {
      label: "Animal Health",
      items: [
        {
          title: "Products",
          href: "/dashboard/animal-health-products",
          icon: "productSearch",
        },
        {
          title: "Categories",
          href: "/dashboard/animal-health-categories",
          icon: "clipboardList",
        },
        {
          title: "Ingredients",
          href: "/dashboard/animal-health-active-ingredients",
          icon: "beaker",
        },
        {
          title: "Targets",
          href: "/dashboard/animal-health-targets",
          icon: "bug",
        },
      ],
    },
    {
      label: "Farm Produce",
      items: [
        {
          title: "Categories",
          href: "/dashboard/farmproducecategories",
          icon: "tractor",
        },
        {
          title: "Products",
          href: "/dashboard/farmproduce",
          icon: "package",
        },
        {
          title: "Crop Groups",
          href: "/dashboard/crop-groups",
          icon: "layers",
        },
        {
          title: "Weed Groups",
          href: "/dashboard/weed-groups",
          icon: "layers",
        },
        {
          title: "Brands",
          href: "/dashboard/brands",
          icon: "tag",
        },
      ],
    },
    {
      label: "Feed",
      items: [
        {
          title: "Products",
          href: "/dashboard/feed-products",
          icon: "productSearch",
        },
        {
          title: "Categories",
          href: "/dashboard/feed-categories",
          icon: "clipboardList",
        },
        {
          title: "Ingredients",
          href: "/dashboard/feed-active-ingredients",
          icon: "beaker",
        },
        {
          title: "Nutritional Specs",
          href: "/dashboard/feed-nutritional-specs",
          icon: "fileSpreadsheet",
        },
        {
          title: "Targets",
          href: "/dashboard/feed-targets",
          icon: "bug",
        },
      ],
    },
    {
      label: "Programs & Pricing",
      items: [
        {
          title: "Spray Programs",
          href: "/dashboard/spray-programs",
          icon: "sprout",
        },
        {
          title: "Feeding Programs",
          href: "/dashboard/feeding-programs",
          icon: "egg",
        },
        {
          title: "Producer Prices",
          href: "/dashboard/prices",
          icon: "billing",
        },
        {
          title: "CDM Prices",
          href: "/dashboard/cdm-prices",
          icon: "billing",
        },
      ],
    },
  ],
}
