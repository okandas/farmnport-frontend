import Link from "next/link"
import { serverFetch } from "@/lib/serverFetch"
import { BuyFeedsClient } from "./BuyFeedsClient"
import { getBuyCategories } from "@/components/generic/BuyCategoriesNav"

export const metadata = {
    title: "Buy Animal Feeds Zimbabwe – Prices & Product Range | farmnport.com",
    description: "Shop poultry feeds, cattle feeds, pig feeds and pet food from top brands. Compare prices and order online.",
    alternates: { canonical: "https://farmnport.com/buy-feeds" },
    openGraph: {
        title: "Buy Animal Feeds Zimbabwe – Prices & Product Range",
        description: "Shop poultry feeds, cattle feeds, pig feeds and pet food from top brands. Compare prices and order online.",
        siteName: "farmnport",
        type: "website" as const,
        url: "https://farmnport.com/buy-feeds",
        images: [{ url: "https://farmnport.com/og-image.png", width: 1200, height: 630, alt: "farmnport" }],
    },
    twitter: {
        card: "summary_large_image" as const,
        title: "Buy Animal Feeds Zimbabwe – Prices & Product Range",
        description: "Shop poultry feeds, cattle feeds, pig feeds and pet food from top brands. Compare prices and order online.",
        images: ["/og-image.png"],
    },
}

export default async function BuyFeedsPage() {
    let initialProducts: any[] = []
    let initialTotal = 0

    try {
        const result = await serverFetch("/feed/buy")
        initialProducts = result?.data || []
        initialTotal = result?.total || 0
    } catch (error) {
        console.error("Error fetching feed products:", error)
    }

    const categories = await getBuyCategories()

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
            { "@type": "ListItem", "position": 2, "name": "Buy", "item": "https://farmnport.com/buy" },
            { "@type": "ListItem", "position": 3, "name": "Animal Feed", "item": "https://farmnport.com/buy-feeds" },
        ],
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
                <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
                    <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/buy" className="hover:text-foreground transition-colors">Buy</Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">Animal Feed</span>
                </nav>
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight font-heading mb-4">
                        Buy Livestock Feed Online
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Shop our complete range of quality feed products for all livestock
                    </p>
                </div>

                <BuyFeedsClient
                    initialProducts={initialProducts}
                    initialTotal={initialTotal}
                    categories={categories}
                />
            </div>
        </div>
    )
}
