import Link from "next/link"
import { AllPlantNutritionClient } from "./AllPlantNutritionClient"
import { serverFetch } from "@/lib/serverFetch"

export const metadata = {
  title: 'Plant Nutrition Guides Zimbabwe – Fertilizers, Foliar Feeds & Biostimulants | farmnport.com',
  description: 'Browse plant nutrition product guides for Zimbabwe farmers. Fertilizers, foliar feeds, biostimulants — application rates, active ingredients, and usage guidelines for better crop nutrition.',
  keywords: 'plant nutrition zimbabwe, fertilizers zimbabwe, foliar feeds zimbabwe, biostimulants, crop nutrition products, application rates zimbabwe, plant growth regulators',
  alternates: { canonical: '/plant-nutrition-guides' },
  openGraph: {
    title: 'Plant Nutrition Guides Zimbabwe',
    description: 'Browse plant nutrition product guides for Zimbabwe farmers. Fertilizers, foliar feeds, biostimulants — application rates and usage guidelines.',
    url: 'https://farmnport.com/plant-nutrition-guides',
    siteName: 'farmnport',
    type: 'website',
    images: [{ url: "https://farmnport.com/api/og", width: 1200, height: 630, alt: "farmnport" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Plant Nutrition Guides Zimbabwe",
    description: "Browse plant nutrition product guides for Zimbabwe farmers. Fertilizers, foliar feeds, biostimulants — application rates and usage guidelines.",
    images: ["/api/og"],
  },
}

export default async function PlantNutritionGuidesPage() {
    const productsRes = await serverFetch("/plantnutrition/all").catch(() => null)

    const initialProducts = productsRes?.data || []
    const initialTotal = productsRes?.total || 0

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
            { "@type": "ListItem", "position": 2, "name": "Guides", "item": "https://farmnport.com/guides" },
            { "@type": "ListItem", "position": 3, "name": "Plant Nutrition Guides", "item": "https://farmnport.com/plant-nutrition-guides" },
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
                        <span className="text-foreground">Plant Nutrition Guides</span>
                    </nav>
                    <div className="mb-8 flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight font-heading">
                                Plant Nutrition Guides
                            </h2>
                            <p className="text-muted-foreground mt-2 max-w-lg">
                                Application rates, active ingredients, and usage guidelines for fertilizers, foliar feeds, biostimulants, and plant growth regulators.
                            </p>
                        </div>
                    </div>
                    <AllPlantNutritionClient initialProducts={initialProducts} initialTotal={initialTotal} />
                </div>
            </section>
        </main>
    )
}
