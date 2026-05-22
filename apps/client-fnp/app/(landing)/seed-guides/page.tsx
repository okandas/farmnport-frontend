import Link from "next/link"
import { AllSeedGuidesClient } from "./AllSeedGuidesClient"
import { queryAllSeedProducts } from "@/lib/query"
import { OtherGuidesLinks } from "@/components/shared/OtherGuidesLinks"

export const metadata = {
  title: 'Seed Guides Zimbabwe – Potatoes, Maize, Tomatoes, Chillies & More | farmnport.com',
  description: 'Browse certified seed variety guides for Zimbabwe farmers. Potatoes, maize, tomatoes, chillies, and vegetables — planting seasons, days to maturity, yield potential, and growing guides.',
  alternates: { canonical: '/seed-guides' },
  openGraph: {
    title: 'Seed Guides Zimbabwe',
    description: 'Certified seed variety guides for Zimbabwe farmers. Planting seasons, days to maturity, yield potential, and growing guides.',
    siteName: 'farmnport',
    type: 'website',
  },
}

export default async function SeedGuidesPage() {
    const productsRes = await queryAllSeedProducts({ p: 1, brand: [] }).catch(() => null)

    const initialProducts = productsRes?.data?.data || []
    const initialTotal = productsRes?.data?.total || 0

    return (
        <main className="bg-gradient-to-b from-background to-muted/20">
            <section className="py-6 lg:py-8 bg-muted/30">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <nav className="flex text-sm text-muted-foreground mb-6">
                        <Link href="/guides" className="hover:text-foreground transition-colors">Guides</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground">Seed Guides</span>
                    </nav>
                    <div className="mb-8 flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight font-heading">
                                Seed Guides
                            </h2>
                            <p className="text-muted-foreground mt-2 max-w-lg">
                                Certified seed varieties — planting seasons, days to maturity, yield potential, and growing guides for potatoes, maize, tomatoes, chillies, and more.
                            </p>
                        </div>
                        <OtherGuidesLinks current="seeds" />
                    </div>
                    <AllSeedGuidesClient initialProducts={initialProducts} initialTotal={initialTotal} />
                </div>
            </section>
        </main>
    )
}
