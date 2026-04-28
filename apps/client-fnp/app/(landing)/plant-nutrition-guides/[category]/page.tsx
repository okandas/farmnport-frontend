import Link from "next/link"
import { BaseURL } from "@/lib/schemas"
import { PlantNutritionCategoryClient } from "./PlantNutritionCategoryClient"

const fetchOptions: RequestInit = process.env.NODE_ENV === "production"
    ? { next: { revalidate: 3600 } } as RequestInit
    : { cache: "no-store" }

async function getCategoryProducts(category: string) {
    try {
        const res = await fetch(`${BaseURL}/plantnutrition/category/${category}`, fetchOptions)
        if (!res.ok) return { data: [], total: 0 }
        const json = await res.json()
        return { data: json?.data || [], total: json?.total || 0 }
    } catch {
        return { data: [], total: 0 }
    }
}

interface CategoryPageProps {
    params: Promise<{ category: string }>
}

export default async function PlantNutritionCategoryPage({ params }: CategoryPageProps) {
    const { category } = await params
    const { data: products, total } = await getCategoryProducts(category)

    const categoryName = products[0]?.plant_nutrition_category?.name || category.replace(/-/g, ' ')

    return (
        <main className="bg-gradient-to-b from-background to-muted/20">
            <section className="py-14 lg:py-20 bg-muted/30">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <nav className="flex text-sm text-muted-foreground mb-6">
                        <Link href="/guides" className="hover:text-foreground transition-colors">Guides</Link>
                        <span className="mx-2">/</span>
                        <Link href="/plant-nutrition-guides" className="hover:text-foreground transition-colors">Plant Nutrition Guides</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground capitalize">{categoryName}</span>
                    </nav>
                    <PlantNutritionCategoryClient
                        category={category}
                        categoryName={categoryName}
                        initialProducts={products}
                        initialTotal={total}
                    />
                </div>
            </section>
        </main>
    )
}
