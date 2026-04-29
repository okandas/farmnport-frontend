import { queryAllFeedProducts } from "@/lib/query"
import { BuyFeedsClient } from "./BuyFeedsClient"

export default async function BuyFeedsPage() {
    let initialProducts: any[] = []
    let initialTotal = 0

    try {
        const response = await queryAllFeedProducts({ p: 1 })
        initialProducts = response?.data?.data || []
        initialTotal = response?.data?.total || 0
    } catch (error) {
        console.error("Error fetching feed products:", error)
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight font-heading mb-4">
                        Buy Livestock Feed Online
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Shop our complete range of quality feed products for all livestock with fast delivery
                    </p>
                </div>

                <BuyFeedsClient
                    initialProducts={initialProducts}
                    initialTotal={initialTotal}
                />
            </div>
        </div>
    )
}
