import Link from "next/link"
import type { Metadata } from "next"
import { BaseURL } from "@/lib/schemas"
import { FeedListingClient } from "./FeedListingClient"

export const metadata: Metadata = {
    title: "Livestock Feed Guides Zimbabwe — Animal Feed Products & Nutrition | farmnport.com",
    description: "Browse livestock feed product guides for Zimbabwe farmers. Compare poultry, cattle, pig, and goat feeds — nutritional specs, feeding instructions, and brands.",
    keywords: "livestock feed zimbabwe, animal feed products, poultry feed zimbabwe, cattle feed, pig feed, broiler feed guide, layer feed guide, stock feed zimbabwe",
    alternates: { canonical: "/feed-guides" },
    openGraph: {
        title: "Livestock Feed Guides Zimbabwe — Animal Feed Products & Nutrition",
        description: "Browse livestock feed product guides for Zimbabwe farmers. Compare feeds by animal type, phase, and nutritional specs.",
        url: "https://farmnport.com/feed-guides",
        siteName: "farmnport",
        type: "website",
    },
}

const fetchOptions: RequestInit = process.env.NODE_ENV === "production"
    ? { next: { revalidate: 3600 } } as RequestInit
    : { cache: "no-store" }

async function getFeedProducts() {
    try {
        const res = await fetch(`${BaseURL}/feed/all`, fetchOptions)
        if (!res.ok) return { data: [], total: 0 }
        const json = await res.json()
        return { data: json?.data || [], total: json?.total || 0 }
    } catch {
        return { data: [], total: 0 }
    }
}

export default async function FeedProductsPage() {
    const { data, total } = await getFeedProducts()

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
            { "@type": "ListItem", "position": 2, "name": "Guides", "item": "https://farmnport.com/guides" },
            { "@type": "ListItem", "position": 3, "name": "Feed Guides", "item": "https://farmnport.com/feed-guides" },
        ],
    }

    return (
        <main>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[70lvh]">
                <div className="pt-10 pb-6">
                    <nav className="flex text-sm text-muted-foreground mb-4">
                        <Link href="/guides" className="hover:text-foreground transition-colors">Guides</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground">Animal Nutrition</span>
                    </nav>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold font-heading tracking-tight">
                                Livestock Feed Products
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Browse our complete collection of livestock feed products across all categories and animal types.
                            </p>
                        </div>
                    </div>
                </div>

                <FeedListingClient initialData={data} initialTotal={total} />
            </div>
        </main>
    )
}
