import { queryAllPlantNutritionProducts } from "@/lib/query"
import { BuyPlantNutritionClient } from "./BuyPlantNutritionClient"

export default async function BuyPlantNutritionPage() {
    let initialProducts: any[] = []
    let initialTotal = 0

    try {
        const response = await queryAllPlantNutritionProducts({ p: 1 })
        initialProducts = response?.data?.data || []
        initialTotal = response?.data?.total || 0
    } catch (error) {
        console.error("Error fetching plant nutrition products:", error)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight font-heading mb-4">
                        Buy Plant Nutrition Products Online
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Shop our complete range of fertilizers and crop nutrition products with fast delivery
                    </p>
                </div>

                <BuyPlantNutritionClient
                    initialProducts={initialProducts}
                    initialTotal={initialTotal}
                />
            </div>
        </div>
    )
}
