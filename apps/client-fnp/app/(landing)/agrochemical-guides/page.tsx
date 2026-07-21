import Link from "next/link"
import { AllAgroChemicalsClient } from "./AllAgroChemicalsClient"
import { serverFetch } from "@/lib/serverFetch"
import { OtherGuidesLinks } from "@/components/shared/OtherGuidesLinks"
import { getGuidesCategories } from "@/components/generic/GuidesCategoriesNav"

export const metadata = {
  title: 'Agrochemical Guides Zimbabwe – Herbicides, Fungicides, Insecticides & More | farmnport.com',
  description: 'Browse agrochemical product guides for Zimbabwe farmers. Herbicides, fungicides, insecticides, acaricides, and fertilizers — active ingredients, dosage rates, and application guidelines.',
  alternates: { canonical: '/agrochemical-guides' },
  openGraph: {
    title: 'Agrochemical Guides Zimbabwe',
    description: 'Browse agrochemical product guides for Zimbabwe farmers. Herbicides, fungicides, insecticides, acaricides — dosage rates and application guidelines.',
    siteName: 'farmnport',
    type: 'website',
  },
}

export default async function AgrochemicalGuidesPage() {
    const chemicalsRes = await serverFetch("/agrochemical/all").catch(() => null)

    const initialChemicals = chemicalsRes?.data || []
    const initialTotal = chemicalsRes?.total || 0

    return (
        <main className="bg-gradient-to-b from-background to-muted/20">
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
                        <OtherGuidesLinks current="agrochemical" />
                    </div>
                    <AllAgroChemicalsClient initialChemicals={initialChemicals} initialTotal={initialTotal} />
                </div>
            </section>
        </main>
    )
}
