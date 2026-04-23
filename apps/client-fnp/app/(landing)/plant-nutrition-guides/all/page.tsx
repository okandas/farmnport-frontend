import { BaseURL } from "@/lib/schemas"
import Link from "next/link"
import { PlantNutritionCard } from "@/components/plantnutrition/PlantNutritionCard"

const fetchOptions: RequestInit = process.env.NODE_ENV === "production"
    ? { next: { revalidate: 3600 } } as RequestInit
    : { cache: "no-store" }

async function getAllProducts() {
    try {
        const res = await fetch(`${BaseURL}/plantnutrition/all`, fetchOptions)
        if (!res.ok) return { data: [], total: 0 }
        const json = await res.json()
        return { data: json?.data || [], total: json?.total || 0 }
    } catch {
        return { data: [], total: 0 }
    }
}

export default async function AllPlantNutritionPage() {
    const { data: products, total } = await getAllProducts()

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="border-b">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/plant-nutrition-guides" className="hover:text-foreground">Plant Nutrition</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground">All</span>
                    </nav>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight font-heading mb-2">All Plant Nutrition Guides</h1>
                    <p className="text-muted-foreground">{total} product{total !== 1 ? 's' : ''}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {products.map((product: any) => (
                        <PlantNutritionCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    )
}
