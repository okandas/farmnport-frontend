import Link from "next/link"
import { BaseURL } from "@/lib/schemas"
import { AllAnimalHealthClient } from "./AllAnimalHealthClient"

export const metadata = {
  title: 'Animal Health Product Guides Zimbabwe – Vaccines, Antibiotics & Supplements | farmnport.com',
  description: 'Browse animal health product guides for poultry and livestock in Zimbabwe. Vaccines, antibiotics, nutrition supplements, anti-protozoals, and biosecurity disinfectants — dosage rates and usage guidelines.',
  keywords: 'animal health products zimbabwe, poultry vaccines zimbabwe, livestock antibiotics, veterinary products zimbabwe, animal health guides, poultry supplements zimbabwe',
  alternates: { canonical: '/animal-health-guides' },
  openGraph: {
    title: 'Animal Health Product Guides Zimbabwe',
    description: 'Browse animal health product guides for poultry and livestock in Zimbabwe. Vaccines, antibiotics, supplements — dosage rates and usage guidelines.',
    url: 'https://farmnport.com/animal-health-guides',
    siteName: 'farmnport',
    type: 'website',
    images: [{ url: "https://farmnport.com/api/og", width: 1200, height: 630, alt: "farmnport" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Animal Health Product Guides Zimbabwe",
    description: "Browse animal health product guides for poultry and livestock in Zimbabwe. Vaccines, antibiotics, supplements — dosage rates and usage guidelines.",
    images: ["/api/og"],
  },
}

const fetchOptions: RequestInit = process.env.NODE_ENV === "production"
    ? { next: { revalidate: 3600 } } as RequestInit
    : { cache: "no-store" }

async function getAllProducts() {
    try {
        const res = await fetch(`${BaseURL}/animalhealth/all`, fetchOptions)
        if (!res.ok) return { data: [], total: 0 }
        const json = await res.json()
        return { data: json?.data || [], total: json?.total || 0 }
    } catch {
        return { data: [], total: 0 }
    }
}

export default async function AnimalHealthGuidesPage() {
    const { data: products, total } = await getAllProducts()

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
            { "@type": "ListItem", "position": 2, "name": "Guides", "item": "https://farmnport.com/guides" },
            { "@type": "ListItem", "position": 3, "name": "Animal Health Guides", "item": "https://farmnport.com/animal-health-guides" },
        ],
    }

    return (
        <main className="bg-gradient-to-b from-background to-muted/20">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            <section className="py-6 lg:py-8 bg-muted/30">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <nav className="flex text-sm text-muted-foreground mb-6">
                        <Link href="/guides" className="hover:text-foreground transition-colors">Guides</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground">Animal Health Guides</span>
                    </nav>
                    <div className="mb-8 flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight font-heading">
                                Animal Health Guides
                            </h2>
                            <p className="text-muted-foreground mt-2 max-w-lg">
                                Explore animal health products by type. Each guide includes active ingredients, targets, and usage information.
                            </p>
                        </div>
                    </div>
                    <AllAnimalHealthClient initialProducts={products} initialTotal={total} />
                </div>
            </section>
        </main>
    )
}
