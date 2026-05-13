import Link from "next/link"
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
                <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
                    <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/buy" className="hover:text-foreground transition-colors">Buy</Link>
                    <span>/</span>
                    <span className="text-foreground font-medium">Animal Health</span>
                </nav>
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
