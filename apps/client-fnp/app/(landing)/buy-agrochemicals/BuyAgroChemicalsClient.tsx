"use client"

import { useQuery } from "@tanstack/react-query"
import { queryAllAgroChemicals } from "@/lib/query"
import { Button } from "@/components/ui/button"
import { AgroChemicalFilterSidebar } from "@/components/generic/agroChemicalFilterSidebar"
import { AgroChemicalCard } from "@/components/agrochemical/AgroChemicalCard"
import { BuyCategoriesNav } from "@/components/generic/BuyCategoriesNav"
import { useQueryStates, parseAsArrayOf, parseAsString, parseAsInteger } from "nuqs"
import { Beaker } from "lucide-react"

interface BuyAgroChemicalsClientProps {
    initialChemicals: any[]
    initialTotal: number
}

export function BuyAgroChemicalsClient({ initialChemicals, initialTotal }: BuyAgroChemicalsClientProps) {
    const [queryState, setQueryState] = useQueryStates({
        brand: parseAsArrayOf(parseAsString),
        target: parseAsArrayOf(parseAsString),
        active_ingredient: parseAsArrayOf(parseAsString),
        p: parseAsInteger.withDefault(1),
    })

    const hasFilters =
        (queryState.brand && queryState.brand.length > 0) ||
        (queryState.target && queryState.target.length > 0) ||
        (queryState.active_ingredient && queryState.active_ingredient.length > 0) ||
        queryState.p > 1

    const { data: chemicalsData, isLoading: chemicalsLoading } = useQuery({
        queryKey: ["agrochemicals-shop", queryState.p, queryState.brand, queryState.target, queryState.active_ingredient],
        queryFn: () => queryAllAgroChemicals({
            p: queryState.p,
            brand: queryState.brand || [],
            target: queryState.target || [],
            active_ingredient: queryState.active_ingredient || [],
        }),
        refetchOnWindowFocus: false,
        placeholderData: !hasFilters ? { data: { data: initialChemicals, total: initialTotal } } as any : undefined,
    })

    const chemicals = chemicalsData?.data?.data || []
    const totalPages = Math.ceil((chemicalsData?.data?.total || 0) / 20)

    const handlePageChange = (newPage: number) => {
        setQueryState({ p: newPage })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-64 flex-shrink-0">
                <BuyCategoriesNav />
                <AgroChemicalFilterSidebar />
            </aside>

            {/* Main Content */}
            <main className="flex-1">
                {chemicalsLoading ? (
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
                ) : chemicals.length === 0 ? (
                    <div className="text-center py-12">
                        <Beaker className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No agrochemicals found matching your filters.</p>
                    </div>
                ) : (
                    <>
                        {/* Results count */}
                        <div className="mb-4 text-sm text-muted-foreground">
                            Showing {chemicals.length} of {chemicalsData?.data?.total || 0} products
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {chemicals.map((chemical: any) => (
                                <AgroChemicalCard
                                    key={chemical.id}
                                    chemical={chemical}
                                    mode="shop"
                                />
                            ))}
                        </div>

                        {/* Pagination */}
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
                                    .filter(pageNum => {
                                        return (
                                            pageNum === 1 ||
                                            pageNum === totalPages ||
                                            (pageNum >= queryState.p - 2 && pageNum <= queryState.p + 2)
                                        )
                                    })
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
