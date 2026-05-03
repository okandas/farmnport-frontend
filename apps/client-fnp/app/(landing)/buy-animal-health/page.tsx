import { queryAllAnimalHealthProducts } from "@/lib/query"
import { BuyAnimalHealthClient } from "./BuyAnimalHealthClient"

export default async function BuyAnimalHealthPage() {
    let initialProducts: any[] = []
    let initialTotal = 0

    try {
        const response = await queryAllAnimalHealthProducts({
            p: 1,
            brand: [],
            target: [],
            active_ingredient: [],
        })
        initialProducts = response?.data?.data || []
        initialTotal = response?.data?.total || 0
    } catch (error) {
        console.error("Error fetching animal health products:", error)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight font-heading mb-4">
                        Buy Animal Health Products Online
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Shop our complete range of quality animal health products
                    </p>
                </div>

                <BuyAnimalHealthClient
                    initialProducts={initialProducts}
                    initialTotal={initialTotal}
                />
            </div>
        </div>
    )
}
