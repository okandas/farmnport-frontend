import { AllPlantNutritionClient } from "./AllPlantNutritionClient"
import { queryAllPlantNutritionProducts } from "@/lib/query"

export default async function PlantNutritionGuidesPage() {
    const productsRes = await queryAllPlantNutritionProducts({ p: 1, brand: [] }).catch(() => null)

    const initialProducts = productsRes?.data?.data || []
    const initialTotal = productsRes?.data?.total || 0

    return (
        <main className="bg-gradient-to-b from-background to-muted/20">
            <section className="py-14 lg:py-20 bg-muted/30">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold tracking-tight font-heading">
                            Plant Nutrition Guides
                        </h2>
                        <p className="text-muted-foreground mt-2 max-w-lg">
                            Application rates, active ingredients, and usage guidelines for fertilizers, foliar feeds, biostimulants, and plant growth regulators.
                        </p>
                    </div>
                    <AllPlantNutritionClient initialProducts={initialProducts} initialTotal={initialTotal} />
                </div>
            </section>
        </main>
    )
}
