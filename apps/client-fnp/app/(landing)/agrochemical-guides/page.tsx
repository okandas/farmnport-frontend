import Link from "next/link"
import { AllAgroChemicalsClient } from "./AllAgroChemicalsClient"
import { serverFetch } from "@/lib/serverFetch"

export const metadata = {
  title: 'Agrochemical Guides Zimbabwe – Herbicides, Fungicides, Insecticides & More | farmnport.com',
  description: 'Browse agrochemical product guides for Zimbabwe farmers. Herbicides, fungicides, insecticides, acaricides, and fertilizers — active ingredients, dosage rates, and application guidelines.',
  keywords: 'agrochemical guides zimbabwe, herbicides zimbabwe, fungicides zimbabwe, insecticides zimbabwe, crop protection products, agrochemical dosage rates, pesticides zimbabwe',
  alternates: { canonical: '/agrochemical-guides' },
  openGraph: {
    title: 'Agrochemical Guides Zimbabwe',
    description: 'Browse agrochemical product guides for Zimbabwe farmers. Herbicides, fungicides, insecticides, acaricides — dosage rates and application guidelines.',
    url: 'https://farmnport.com/agrochemical-guides',
    siteName: 'farmnport',
    type: 'website',
  },
}

export default async function AgrochemicalGuidesPage() {
    const chemicalsRes = await serverFetch("/agrochemical/all").catch(() => null)

    const initialChemicals = chemicalsRes?.data || []
    const initialTotal = chemicalsRes?.total || 0

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
            { "@type": "ListItem", "position": 2, "name": "Guides", "item": "https://farmnport.com/guides" },
            { "@type": "ListItem", "position": 3, "name": "Agrochemical Guides", "item": "https://farmnport.com/agrochemical-guides" },
        ],
    }

    return (
        <main className="bg-gradient-to-b from-background to-muted/20">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            {/* Products Section */}
            <section className="py-6 lg:py-8 bg-muted/30">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <nav className="flex text-sm text-muted-foreground mb-6">
                        <Link href="/guides" className="hover:text-foreground transition-colors">Guides</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground">Agrochemical Guides</span>
                    </nav>
                    <div className="mb-8 flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight font-heading">
                                Agrochemical Guides
                            </h2>
                            <p className="text-muted-foreground mt-2 max-w-lg">
                                Explore agrochemical products by type. Each guide includes active ingredients, targets, and usage information.
                            </p>
                        </div>
                    </div>
                    <AllAgroChemicalsClient initialChemicals={initialChemicals} initialTotal={initialTotal} />
                </div>
            </section>
        </main>
    )
}
