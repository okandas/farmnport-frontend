import Link from "next/link"
import { AllPlantNutritionClient } from "./AllPlantNutritionClient"
import { queryAllPlantNutritionProducts } from "@/lib/query"
import { OtherGuidesLinks } from "@/components/shared/OtherGuidesLinks"

export default async function PlantNutritionGuidesPage() {
    const productsRes = await queryAllPlantNutritionProducts({ p: 1, brand: [] }).catch(() => null)

    const initialProducts = productsRes?.data?.data || []
    const initialTotal = productsRes?.data?.total || 0

    return (
        <main className="bg-gradient-to-b from-background to-muted/20">
            <section className="py-14 lg:py-20 bg-muted/30">
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
                        <OtherGuidesLinks current="plant-nutrition" />
                    </div>
                    <AllPlantNutritionClient initialProducts={initialProducts} initialTotal={initialTotal} />
                </div>
            </section>
        </main>
    )
}
