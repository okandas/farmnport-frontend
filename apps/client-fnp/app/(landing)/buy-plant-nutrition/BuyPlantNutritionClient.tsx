"use client"

import { useQuery } from "@tanstack/react-query"
import { queryBuyPlantNutritionProducts } from "@/lib/query"
import { Button } from "@/components/ui/button"
import { PlantNutritionBuyFilterSidebar } from "@/components/generic/plantNutritionFilterSidebar"
import { BuyCategoriesNav } from "@/components/generic/BuyCategoriesNav"
import { useQueryStates, parseAsArrayOf, parseAsString, parseAsInteger } from "nuqs"
import { ProductCard } from "@/components/shared/ProductCard"

interface BuyPlantNutritionClientProps {
    initialProducts: any[]
    initialTotal: number
}

export function BuyPlantNutritionClient({ initialProducts, initialTotal }: BuyPlantNutritionClientProps) {
    const [queryState, setQueryState] = useQueryStates({
        brand: parseAsArrayOf(parseAsString),
        category: parseAsArrayOf(parseAsString),
        active_ingredient: parseAsArrayOf(parseAsString),
        used_on: parseAsArrayOf(parseAsString),
        p: parseAsInteger.withDefault(1),
    })

    const hasFilters =
        (queryState.brand && queryState.brand.length > 0) ||
        (queryState.category && queryState.category.length > 0) ||
        (queryState.active_ingredient && queryState.active_ingredient.length > 0) ||
        (queryState.used_on && queryState.used_on.length > 0) ||
        queryState.p > 1

    const { data: productsData, isLoading: productsLoading } = useQuery({
        queryKey: ["plant-nutrition-shop", queryState.p, queryState.brand, queryState.category, queryState.active_ingredient, queryState.used_on],
        queryFn: () => queryBuyPlantNutritionProducts({
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
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <aside className="w-full lg:w-64 flex-shrink-0">
                <BuyCategoriesNav />
                <PlantNutritionBuyFilterSidebar />
            </aside>

            <main className="flex-1">
                {productsLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-card border border-border rounded-lg overflow-hidden">
                                    <div className="aspect-square bg-muted" />
                                    <div className="p-4 space-y-3 border-t">
                                        <div className="h-3 bg-muted rounded w-1/3" />
                                        <div className="h-4 bg-muted rounded w-4/5" />
                                        <div className="h-4 bg-muted rounded w-3/5" />
                                        <div className="flex gap-4 pt-2 border-t">
                                            <div className="h-3 bg-muted rounded w-16" />
                                            <div className="h-3 bg-muted rounded w-16" />
                                        </div>
                                        <div className="h-10 bg-muted rounded mt-4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto bg-muted/30 rounded-full mb-4" />
                        <p className="text-muted-foreground">No plant nutrition products found matching your filters.</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 text-sm text-muted-foreground">
                            Showing {products.length} of {productsData?.data?.total || 0} products
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {products.map((product: any) => (
                                <ProductCard
                                    key={product.id}
                                    href={`/buy-plant-nutrition/${product.slug}`}
                                    imageSrc={product.images?.[0]?.img?.src}
                                    name={product.name}
                                    brand={product.brand?.name}
                                    meta={product.plant_nutrition_category?.name}
                                    mode="buy"
                                    productId={product.id}
                                    productType="plant_nutrition"
                                    productSlug={product.slug}
                                   
                                    salePrice={product.sale_price}
                                    wasPrice={product.was_price}
                                    showWasPrice={product.show_was_price}
                                    availableForSale={product.available_for_sale}
                                    stockLevel={product.stock_level}
                                    hasVariants={product.variants?.length > 0}
                                    variantPriceRange={product.variant_price_range}
                                    pickupOnly={product.pickup_location_ids?.length > 0 && !product.delivery_available && !(product.delivery_location_ids?.length > 0)}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center gap-1">
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
                                                {showEllipsis && (
                                                    <span className="px-2 text-muted-foreground">...</span>
                                                )}
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
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}
