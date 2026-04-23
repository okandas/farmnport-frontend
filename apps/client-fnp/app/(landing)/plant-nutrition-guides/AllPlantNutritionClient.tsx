"use client"

import { useQuery } from "@tanstack/react-query"
import { queryAllPlantNutritionProducts } from "@/lib/query"
import { Button } from "@/components/ui/button"
import { Leaf } from "lucide-react"
import { PlantNutritionCard } from "@/components/plantnutrition/PlantNutritionCard"
import { PlantNutritionFilterSidebar } from "@/components/generic/plantNutritionFilterSidebar"
import { useQueryStates, parseAsArrayOf, parseAsString, parseAsInteger } from "nuqs"

interface AllPlantNutritionClientProps {
    initialProducts: any[]
    initialTotal: number
}

export function AllPlantNutritionClient({ initialProducts, initialTotal }: AllPlantNutritionClientProps) {
    const [queryState, setQueryState] = useQueryStates({
        brand: parseAsArrayOf(parseAsString),
        category: parseAsArrayOf(parseAsString),
        active_ingredient: parseAsArrayOf(parseAsString),
        used_on: parseAsArrayOf(parseAsString),
        p: parseAsInteger.withDefault(1),
    })

    const hasFilters = (queryState.brand && queryState.brand.length > 0) ||
        (queryState.category && queryState.category.length > 0) ||
        (queryState.active_ingredient && queryState.active_ingredient.length > 0) ||
        (queryState.used_on && queryState.used_on.length > 0) ||
        queryState.p > 1

    const { data: productsData, isLoading } = useQuery({
        queryKey: ["plant-nutrition-all", queryState.p, queryState.brand, queryState.category, queryState.active_ingredient, queryState.used_on],
        queryFn: () => queryAllPlantNutritionProducts({
            p: queryState.p,
            brand: queryState.brand || [],
            category: queryState.category || [],
            active_ingredient: queryState.active_ingredient || [],
            used_on: queryState.used_on || [],
        }),
        refetchOnWindowFocus: false,
        placeholderData: !hasFilters ? { data: { data: initialProducts, total: initialTotal } } as any : undefined,
    })

    const products = productsData?.data?.data || []
    const totalPages = Math.ceil((productsData?.data?.total || 0) / 20)

    const handlePageChange = (newPage: number) => {
        setQueryState({ p: newPage })
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-64 flex-shrink-0">
                <PlantNutritionFilterSidebar />
            </aside>

            <main className="flex-1">
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
                    <p className="text-muted-foreground">No products found.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {products.map((product: any) => (
                            <PlantNutritionCard key={product.id} product={product} />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-8 flex justify-center gap-1">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(Math.max(1, queryState.p - 1))}
                                disabled={queryState.p === 1}
                            >
                                Previous
                            </Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(pageNum =>
                                    pageNum === 1 ||
                                    pageNum === totalPages ||
                                    (pageNum >= queryState.p - 2 && pageNum <= queryState.p + 2)
                                )
                                .map((pageNum, idx, arr) => {
                                    const prevPageNum = arr[idx - 1]
                                    const showEllipsis = prevPageNum && pageNum - prevPageNum > 1
                                    return (
                                        <div key={pageNum} className="flex items-center gap-1">
                                            {showEllipsis && <span className="px-2 text-muted-foreground">...</span>}
                                            <Button
                                                variant={queryState.p === pageNum ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePageChange(pageNum)}
                                                className="min-w-[40px]"
                                            >
                                                {pageNum}
                                            </Button>
                                        </div>
                                    )
                                })}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(queryState.p + 1)}
                                disabled={queryState.p >= totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </>
            )}
            </main>
        </div>
    )
}
