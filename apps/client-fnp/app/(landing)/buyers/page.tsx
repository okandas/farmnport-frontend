import Link from "next/link"
import { Buyers } from "@/components/layouts/buyers"
import { retrieveUser } from "@/lib/actions"
import { FilterSidebar } from "@/components/generic/filterSidebar"
import { QuickLinks } from "@/components/generic/quick-links"
import { BookingCTA } from "@/components/shared/BookingCTA"


export const metadata = {
    title: 'Sell Your Farm Produce Directly – Reach Buyers Faster. | farmnport.com',
    description: `Farmers, sell your fresh produce directly to buyers! Access fairer markets,
      build customer relationships, and reduce dependency on traditional channels.`,
    alternates: {
        canonical: `/buyers`,
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://farmnport.com/buyers",
        siteName: "Farmnport",
        title: 'Sell Your Farm Produce Directly – Reach Buyers Faster.',
        description: "Farmers, sell your fresh produce directly to buyers! Access fairer markets, build customer relationships, and reduce dependency on traditional channels.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Farmnport Buyers - Sell Your Farm Produce Directly",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: 'Sell Your Farm Produce Directly – Reach Buyers Faster.',
        description: "Farmers, sell your fresh produce directly to buyers! Access fairer markets, build customer relationships, and reduce dependency on traditional channels.",
        images: ["/og-image.png"],
    },
}

export default async function BuyersPage() {
    const user = await retrieveUser()

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
            { "@type": "ListItem", "position": 2, "name": "Market", "item": "https://farmnport.com/market" },
            { "@type": "ListItem", "position": 3, "name": "Buyers", "item": "https://farmnport.com/buyers" },
        ],
    }

    return (
        <main>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-4">
                <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                    <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/market" className="hover:text-foreground transition-colors">Market</Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">Buyers</span>
                </nav>

            </div>
            <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[70lvh] py-8">
                <div className="lg:flex lg:space-x-10">

                    <div className="hidden lg:block lg:w-44 relative">
                        <FilterSidebar clientType="buyers" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <BookingCTA produce="" />
                        <Buyers user={user} />
                    </div>
                    <div className="hidden lg:block lg:w-44 shrink-0">
                        <QuickLinks />
                    </div>
                </div>
            </div>
        </main>
    )
}






