import Link from "next/link"
import { Lots } from "@/components/layouts/lots"
import { MarketBuySidebar } from "@/components/layouts/market-buy-sidebar"
import { QuickLinks } from "@/components/generic/quick-links"
import { getBuyCategories } from "@/components/generic/BuyCategoriesNav"

export const metadata = {
    title: 'Farm Produce Lots Zimbabwe – Buy & Sell Chillies, Maize, Cattle | farmnport.com',
    description: 'Browse farm produce lots listed by farmers across Zimbabwe. Buy chillies, maize, soya beans, cattle and more — directly from sellers at listed prices. New lots added daily.',
    keywords: 'farm produce lots Zimbabwe, buy chillies Zimbabwe, sell farm produce, maize lots, cattle for sale Zimbabwe, agricultural marketplace Zimbabwe, farmnport lots',
    alternates: {
        canonical: `/lots`,
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://farmnport.com/lots",
        siteName: "Farmnport",
        title: 'Farm Produce Lots Zimbabwe – Buy & Sell Directly | farmnport.com',
        description: 'Browse farm produce lots listed by farmers across Zimbabwe. Buy chillies, maize, cattle and more — directly from sellers at listed prices.',
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Farm Produce Lots Zimbabwe – Farmnport",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: 'Farm Produce Lots Zimbabwe – Buy & Sell Directly | farmnport.com',
        description: 'Browse farm produce lots listed by farmers across Zimbabwe. Buy chillies, maize, cattle and more — directly from sellers at listed prices.',
        images: ["/og-image.png"],
    },
}

export default async function LotsPage() {
    const categories = await getBuyCategories()
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
            { "@type": "ListItem", "position": 2, "name": "Buy", "item": "https://farmnport.com/buy" },
            { "@type": "ListItem", "position": 3, "name": "Lots", "item": "https://farmnport.com/lots" },
        ],
    }
    return (
        <main>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <div className="border-b">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-3">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/buy" className="hover:text-foreground">Buy</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground">Lots</span>
                    </nav>
                </div>
            </div>
            <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[70lvh] py-8">
                <div className="lg:flex lg:space-x-10">

                    <div className="hidden lg:block lg:w-56 relative">
                        <MarketBuySidebar categories={categories} />
                    </div>

                    <div className="flex-1 min-w-0">
                        <Lots mode={undefined} />
                    </div>
                    <div className="hidden lg:block lg:w-40 shrink-0">
                        <QuickLinks />
                    </div>
                </div>
            </div>
        </main>
    )
}
