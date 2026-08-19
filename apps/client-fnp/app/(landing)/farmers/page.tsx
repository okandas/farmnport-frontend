import Link from "next/link"
import {Farmers} from "@/components/layouts/farmers"
import { retrieveUser } from "@/lib/actions"
import { FilterSidebar } from "@/components/generic/filterSidebar"
import { QuickLinks } from "@/components/generic/quick-links"


export const metadata = {
  title: 'Buy Fresh Agricultural Produce Directly from Farmers | farmnport.com',
  description: `Looking for fresh, high-quality agricultural produce in Zimbabwe? Buy directly from local farmers for the best prices,
      farm-to-table freshness, and support for Zimbabwean agriculture. Connect with trusted suppliers today!,`,
  alternates: {
    canonical: `/farmers`,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://farmnport.com/farmers",
    siteName: "Farmnport",
    title: 'Buy Fresh Agricultural Produce Directly from Farmers',
    description: "Looking for fresh, high-quality agricultural produce in Zimbabwe? Buy directly from local farmers for the best prices, farm-to-table freshness, and support for Zimbabwean agriculture.",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "Farmnport Farmers - Buy Fresh Agricultural Produce",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: 'Buy Fresh Agricultural Produce Directly from Farmers',
    description: "Looking for fresh, high-quality agricultural produce in Zimbabwe? Buy directly from local farmers for the best prices, farm-to-table freshness, and support for Zimbabwean agriculture.",
    images: ["/api/og"],
  },
}

export default async function FarmersPage() {
  const user = await retrieveUser()

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
      { "@type": "ListItem", "position": 2, "name": "Buy", "item": "https://farmnport.com/buy" },
      { "@type": "ListItem", "position": 3, "name": "Farmers", "item": "https://farmnport.com/farmers" },
    ],
  }

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="container pt-6">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Farmers</span>
        </nav>
      </div>
      <div className="container min-h-[70lvh] pb-8">
        <div className="lg:flex lg:gap-8 mt-4">
          <aside className="hidden lg:block lg:w-64 shrink-0">
            <div className="sticky top-20">
              <FilterSidebar clientType="farmers" />
              <div className="mt-6">
                <QuickLinks />
              </div>
            </div>
          </aside>
          <div className="flex-1 min-w-0">
            <Farmers user={user} />
          </div>
        </div>
      </div>
    </main>
  )
}






