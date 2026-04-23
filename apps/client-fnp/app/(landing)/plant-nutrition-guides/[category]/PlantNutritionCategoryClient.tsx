"use client"

import { useQuery } from "@tanstack/react-query"
import { queryPlantNutritionProductsByCategory } from "@/lib/query"
import { Button } from "@/components/ui/button"
import { Leaf } from "lucide-react"
import { PlantNutritionCard } from "@/components/plantnutrition/PlantNutritionCard"
import { useQueryStates, parseAsArrayOf, parseAsString, parseAsInteger } from "nuqs"
import Link from "next/link"

interface PlantNutritionCategoryClientProps {
    category: string
    categoryName: string
    initialProducts: any[]
    initialTotal: number
}

export function PlantNutritionCategoryClient({ category, categoryName, initialProducts, initialTotal }: PlantNutritionCategoryClientProps) {
    const [queryState, setQueryState] = useQueryStates({
        brand: parseAsArrayOf(parseAsString),
        p: parseAsInteger.withDefault(1),
    })

    const hasFilters = (queryState.brand && queryState.brand.length > 0) || queryState.p > 1

    const { data: productsData, isLoading } = useQuery({
        queryKey: ["plant-nutrition-category", category, queryState.p, queryState.brand],
        queryFn: () => queryPlantNutritionProductsByCategory({
            category,
            p: queryState.p,
            brand: queryState.brand || [],
        }),
        refetchOnWindowFocus: false,
        placeholderData: !hasFilters ? { data: { data: initialProducts, total: initialTotal } } as any : undefined,
    })

    const products = productsData?.data?.data || []
    const totalPages = Math.ceil((productsData?.data?.total || 0) / 20)

    return (
        <>
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight font-heading mb-4 capitalize">
                    {categoryName}
                </h1>
                <p className="text-muted-foreground">
                    {productsData?.data?.total || initialTotal} product{(productsData?.data?.total || initialTotal) !== 1 ? 's' : ''} found
                </p>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
                            <div className="aspect-square bg-muted" />
                            <div className="p-4 space-y-2">
                                <div className="h-3 bg-muted rounded w-1/2" />
                                <div className="h-4 bg-muted rounded" />
                                <div className="h-4 bg-muted rounded w-3/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-16">
                    <Leaf className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">No products found in this category.</p>
                    <Link href="/plant-nutrition-guides" className="mt-4 inline-block">
                        <Button variant="outline" size="sm">Browse Categories</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {products.map((product: any) => (
                        <PlantNutritionCard key={product.id} product={product} />
                    ))}
                </div>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <Button
                            key={page}
                            variant={queryState.p === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setQueryState({ p: page })}
                        >
                            {page}
                        </Button>
                    ))}
                </div>
            )}
        </>
    )
}
