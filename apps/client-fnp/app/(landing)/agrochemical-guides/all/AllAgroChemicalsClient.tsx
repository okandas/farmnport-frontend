"use client"

import { useQuery } from "@tanstack/react-query"
import { queryAllAgroChemicals } from "@/lib/query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Beaker, Search, X } from "lucide-react"
import { AgroChemicalFilterSidebar } from "@/components/generic/agroChemicalFilterSidebar"
import { AgroChemicalCard } from "@/components/agrochemical/AgroChemicalCard"
import { useQueryStates, parseAsArrayOf, parseAsString, parseAsInteger } from "nuqs"

interface AllAgroChemicalsClientProps {
    initialChemicals: any[]
    initialTotal: number
}

export function AllAgroChemicalsClient({ initialChemicals, initialTotal }: AllAgroChemicalsClientProps) {
    const [queryState, setQueryState] = useQueryStates({
        search: parseAsString.withDefault(""),
        brand: parseAsArrayOf(parseAsString),
        target: parseAsArrayOf(parseAsString),
        active_ingredient: parseAsArrayOf(parseAsString),
        used_on: parseAsArrayOf(parseAsString),
        p: parseAsInteger.withDefault(1),
    })

    const hasFilters = queryState.search !== "" ||
        (queryState.brand && queryState.brand.length > 0) ||
        (queryState.target && queryState.target.length > 0) ||
        (queryState.active_ingredient && queryState.active_ingredient.length > 0) ||
        (queryState.used_on && queryState.used_on.length > 0) ||
        queryState.p > 1

    const { data: chemicalsData, isLoading: chemicalsLoading } = useQuery({
        queryKey: ["agrochemicals-all", queryState.p, queryState.search, queryState.brand, queryState.target, queryState.active_ingredient, queryState.used_on],
        queryFn: () => queryAllAgroChemicals({
            p: queryState.p,
            search: queryState.search,
            brand: queryState.brand || [],
            target: queryState.target || [],
            active_ingredient: queryState.active_ingredient || [],
            used_on: queryState.used_on || [],
        }),
        refetchOnWindowFocus: false,
        placeholderData: !hasFilters ? { data: { data: initialChemicals, total: initialTotal } } as any : undefined,
    })

    const chemicals = chemicalsData?.data?.data || []
    const totalPages = Math.ceil((chemicalsData?.data?.total || 0) / 20)

    const handlePageChange = (newPage: number) => {
        setQueryState({ p: newPage })
    }

    return (
        <>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight font-heading mb-4">
                    {queryState.search ? `Results for "${queryState.search}"` : "All Agrochemicals"}
                </h1>
                <p className="text-lg text-muted-foreground">
                    Browse our complete collection of agrochemical products
                </p>
                <div className="mt-4 flex items-center gap-2 max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products, active ingredients..."
                            value={queryState.search}
                            onChange={(e) => setQueryState({ search: e.target.value, p: 1 })}
                            className="pl-10"
                        />
                    </div>
                    {queryState.search && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setQueryState({ search: "", p: 1 })}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <AgroChemicalFilterSidebar />
                </aside>

                {/* Main Content */}
                <main className="flex-1">
                    {chemicalsLoading ? (
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
                    ) : chemicals.length === 0 ? (
                        <div className="text-center py-12">
                            <Beaker className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">No agrochemicals found matching your filters.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                                {chemicals.map((chemical: any) => (
                                    <AgroChemicalCard
                                        key={chemical.id}
                                        chemical={chemical}
                                        mode="guide"
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
        </>
    )
}
