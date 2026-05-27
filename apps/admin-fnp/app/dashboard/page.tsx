import Link from "next/link"

export const metadata = {
  title: "OI - Manage Apps",
}

const apps = [
  {
    href: "/dashboard/farmnport",
    name: "Farmnport",
    description: "Manage products, users, prices, and programs",
    color: "bg-green-500",
    initials: "FP",
    links: [
      { label: "Products", href: "/dashboard/farmnport/products" },
      { label: "Users", href: "/dashboard/farmnport/users" },
      { label: "Buyers", href: "/dashboard/farmnport/buyers" },
    ],
  },
  {
    href: "/dashboard/restaurants",
    name: "Restaurants",
    description: "Manage restaurant listings, locations, subscriptions, and sales",
    color: "bg-orange-500",
    initials: "RS",
    links: [
      { label: "Restaurants", href: "/dashboard/restaurants" },
      { label: "Menus", href: "/dashboard/restaurants/menus" },
    ],
  },
  {
    href: "/dashboard/tumira",
    name: "Tumira",
    description: "Manage delivery wards, couriers, rates, and vanity codes",
    color: "bg-blue-500",
    initials: "TM",
    links: [
      { label: "Wards", href: "/dashboard/tumira/wards" },
      { label: "Couriers", href: "/dashboard/tumira/couriers" },
      { label: "Vanity Codes", href: "/dashboard/tumira/vanity-codes" },
    ],
  },
]

export default function AppSelectorPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b bg-background">
        <div className="mx-auto max-w-5xl px-6 py-5">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Select an application to manage</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {apps.map((app) => (
            <div key={app.href} className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <Link href={app.href} className="block p-5 hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`${app.color} rounded-lg w-10 h-10 flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                    {app.initials}
                  </div>
                  <div>
                    <h2 className="font-semibold leading-tight">{app.name}</h2>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-snug">{app.description}</p>
              </Link>
              <div className="border-t px-5 py-3 flex gap-3">
                {app.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
