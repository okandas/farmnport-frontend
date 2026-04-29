import Link from "next/link"
import { AllAgroChemicalsClient } from "./AllAgroChemicalsClient"
import { queryAllAgroChemicals } from "@/lib/query"
import { OtherGuidesLinks } from "@/components/shared/OtherGuidesLinks"

export default async function AgrochemicalGuidesPage() {
    const chemicalsRes = await queryAllAgroChemicals({ p: 1, search: "", brand: [], target: [], active_ingredient: [], used_on: [] }).catch(() => null)

    const initialChemicals = chemicalsRes?.data?.data || []
    const initialTotal = chemicalsRes?.data?.total || 0

    return (
        <main className="bg-gradient-to-b from-background to-muted/20">
            {/* Products Section */}
            <section className="py-14 lg:py-20 bg-muted/30">
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
