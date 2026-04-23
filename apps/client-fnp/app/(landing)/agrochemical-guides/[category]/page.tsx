import { queryAgroChemicalsByCategory } from "@/lib/query"
import Link from "next/link"
import { AgroCategoryClient } from "./AgroCategoryClient"

interface CategoryPageProps {
    params: Promise<{
        category: string
    }>
}

export default async function AgroChemicalCategoryPage({ params }: CategoryPageProps) {
    const { category } = await params

    let initialChemicals: any[] = []
    let initialTotal = 0

    try {
        const response = await queryAgroChemicalsByCategory({
            category,
            p: 1,
            brand: [],
            target: [],
            active_ingredient: [],
        })
        initialChemicals = response?.data?.data || []
        initialTotal = response?.data?.total || 0
    } catch (error) {
        console.error("Error fetching agrochemicals by category:", error)
    }

    const categoryName = initialChemicals[0]?.agrochemical_category?.name || category
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            {/* Breadcrumb */}
            <div className="border-b">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/agrochemical-guides" className="hover:text-foreground">Guides</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground capitalize">{categoryName}</span>
                    </nav>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight font-heading mb-4 capitalize">
                        {categoryName}
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Browse our collection of {categoryName.toLowerCase()} products
                    </p>
                </div>

                <AgroCategoryClient
                    category={category}
                    categoryName={categoryName}
                    initialChemicals={initialChemicals}
                    initialTotal={initialTotal}
                />
            </div>
        </div>
    )
}
