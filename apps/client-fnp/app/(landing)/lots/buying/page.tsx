import Link from "next/link"
import { Lots } from "@/components/layouts/lots"
import { MarketBuySidebar } from "@/components/layouts/market-buy-sidebar"
import { QuickLinks } from "@/components/generic/quick-links"
import { getBuyCategories } from "@/components/generic/BuyCategoriesNav"

export const metadata = {
    title: 'Buying Lots – Farmers Looking to Buy Produce in Zimbabwe | farmnport.com',
    description: 'Browse buying lots from farmers and businesses looking to purchase farm produce across Zimbabwe.',
    alternates: { canonical: `/lots/buying` },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://farmnport.com/lots/buying",
        siteName: "Farmnport",
        title: 'Buying Lots – Farmers Looking to Buy Produce in Zimbabwe | farmnport.com',
        description: 'Browse buying lots from farmers and businesses looking to purchase farm produce across Zimbabwe.',
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Farmnport Buying Lots" }],
    },
}

export default async function BuyingLotsPage() {
    const categories = await getBuyCategories()
    return (
        <main>
            <div className="border-b">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-3">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/buy" className="hover:text-foreground">Buy</Link>
                        <span className="mx-2">/</span>
                        <Link href="/lots" className="hover:text-foreground">Lots</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground">Buying</span>
                    </nav>
                </div>
            </div>
            <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[70lvh] py-8">
                <div className="lg:flex lg:space-x-10">
                    <div className="hidden lg:block lg:w-44 relative">
                        <MarketBuySidebar categories={categories} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <Lots mode="buying" />
                    </div>
                    <div className="hidden lg:block lg:w-44 shrink-0">
                        <QuickLinks />
                    </div>
                </div>
            </div>
        </main>
    )
}
