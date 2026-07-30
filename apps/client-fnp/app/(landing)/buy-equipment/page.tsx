import Link from "next/link"
import { serverFetch } from "@/lib/serverFetch"
import { BuyEquipmentClient } from "./BuyEquipmentClient"
import { getBuyCategories } from "@/components/generic/BuyCategoriesNav"

export const metadata = {
    title: "Buy Farm Equipment Online — Zimbabwe | farmnport.com",
    description: "Shop our complete range of quality agricultural equipment and machinery for Zimbabwe farmers.",
    alternates: { canonical: "https://farmnport.com/buy-equipment" },
    openGraph: {
        title: "Buy Farm Equipment Online — Zimbabwe",
        description: "Shop our complete range of quality agricultural equipment and machinery for Zimbabwe farmers.",
        siteName: "farmnport",
        type: "website" as const,
        url: "https://farmnport.com/buy-equipment",
    },
    twitter: {
        card: "summary_large_image" as const,
        title: "Buy Farm Equipment Online — Zimbabwe",
        description: "Shop our complete range of quality agricultural equipment and machinery for Zimbabwe farmers.",
    },
}

export default async function BuyEquipmentPage() {
    let initialProducts: any[] = []
    let initialTotal = 0

    try {
        const result = await serverFetch("/equipment/buy")
        initialProducts = result?.data || []
        initialTotal = result?.total || 0
    } catch (error) {
        console.error("Error fetching equipment products:", error)
    }

    const categories = await getBuyCategories()

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
            { "@type": "ListItem", "position": 2, "name": "Buy", "item": "https://farmnport.com/buy" },
            { "@type": "ListItem", "position": 3, "name": "Equipment", "item": "https://farmnport.com/buy-equipment" },
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
                    <span className="text-foreground font-medium">Equipment</span>
                </nav>
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight font-heading mb-4">
                        Buy Farm Equipment Online
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Shop our complete range of quality farm equipment and machinery
                    </p>
                </div>

                <BuyEquipmentClient
                    initialProducts={initialProducts}
                    initialTotal={initialTotal}
                    categories={categories}
                />
            </div>
        </div>
    )
}
