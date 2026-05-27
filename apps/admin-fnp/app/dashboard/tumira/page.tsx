import Link from "next/link"

export default function TumiraPage() {
  const sections = [
    {
      label: "Couriers",
      items: [
        {
          href: "/dashboard/tumira/couriers",
          name: "Couriers",
          description: "Add and manage courier companies",
        },
        {
          href: "/dashboard/tumira/courier-rates",
          name: "Courier Rates",
          description: "Configure pricing rates per courier and zone",
        },
      ],
    },
    {
      label: "Network",
      items: [
        {
          href: "/dashboard/tumira/delivery-points",
          name: "Collection Points",
          description: "Registered delivery point codes.",
        },
        {
          href: "/dashboard/tumira/wards",
          name: "Wards",
          description: "View and manage all Zimbabwe delivery wards",
        },
      ],
    },
    {
      label: "Codes",
      items: [
        {
          href: "/dashboard/tumira/vanity-codes",
          name: "Vanity Codes",
          description: "Manage reserved postcodes sold to businesses",
        },
      ],
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Tumira</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Delivery network management — wards, couriers, rates, and vanity codes
        </p>
      </div>

      {sections.map((section) => (
        <div key={section.label}>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            {section.label}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="font-medium text-sm">{item.name}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{item.description}</div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
