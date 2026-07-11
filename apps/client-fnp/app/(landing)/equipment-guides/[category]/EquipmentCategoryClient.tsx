"use client"

import { useQuery } from "@tanstack/react-query"
import { queryEquipmentProductsByCategory } from "@/lib/query"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/shared/ProductCard"
import { useQueryStates, parseAsArrayOf, parseAsString, parseAsInteger } from "nuqs"
import Link from "next/link"

interface EquipmentCategoryClientProps {
    category: string
    categoryName: string
    initialProducts: any[]
    initialTotal: number
}

export function EquipmentCategoryClient({ category, categoryName, initialProducts, initialTotal }: EquipmentCategoryClientProps) {
    const [queryState, setQueryState] = useQueryStates({
        brand: parseAsArrayOf(parseAsString),
        p: parseAsInteger.withDefault(1),
    })

    const hasFilters =
        (queryState.brand && queryState.brand.length > 0) ||
        queryState.p > 1

    const { data: productsData, isLoading: productsLoading } = useQuery({
        queryKey: ["equipment-category", category, queryState.p, queryState.brand],
        queryFn: () => queryEquipmentProductsByCategory({
            category,
            p: queryState.p,
            brand: queryState.brand || [],
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
        <>
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight font-heading mb-4 capitalize">
                    {categoryName}
                </h1>
                <p className="text-lg text-muted-foreground">
                    Browse our collection of {typeof categoryName === 'string' ? categoryName.toLowerCase() : category} equipment
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                <main className="flex-1">
                    {productsLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {[...Array(8)].map((_, i) => (
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
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground mb-4">No {typeof categoryName === 'string' ? categoryName.toLowerCase() : ''} equipment found.</p>
                            <Link href="/equipment-guides">
                                <Button variant="outline">View All Equipment</Button>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                                {products.map((product: any) => (
                                    <ProductCard
                                        key={product.id}
                                        href={`/equipment-guides/${product.equipment_category?.slug || "all"}/${product.slug}`}
                                        imageSrc={product.images?.[0]?.img?.src}
                                        name={product.name}
                                        brand={product.brand?.name}
                                        meta={product.equipment_category?.name}
                                        mode="guide"
                                        isTest={product.is_test}
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
        </>
    )
}
