"use client"

import { useQuery } from "@tanstack/react-query"
import { queryAllFeedProducts } from "@/lib/query"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useQueryStates, parseAsArrayOf, parseAsString, parseAsInteger } from "nuqs"
import { FeedFilterSidebar } from "@/components/generic/feedFilterSidebar"

export default function FeedProductsPage() {
    const [queryState, setQueryState] = useQueryStates({
        category: parseAsArrayOf(parseAsString),
        brand: parseAsArrayOf(parseAsString),
        animal: parseAsArrayOf(parseAsString),
        phase: parseAsArrayOf(parseAsString),
        sub_type: parseAsArrayOf(parseAsString),
        p: parseAsInteger.withDefault(1),
    })

    const { data: productsData, isLoading: productsLoading } = useQuery({
        queryKey: ["feed-products", queryState.p, queryState.category, queryState.brand, queryState.animal, queryState.phase, queryState.sub_type],
        queryFn: () => queryAllFeedProducts({
            p: queryState.p,
            category: queryState.category || [],
            brand: queryState.brand || [],
            animal: queryState.animal || [],
            phase: queryState.phase || [],
            sub_type: queryState.sub_type || [],
        }),
        refetchOnWindowFocus: false,
    })

    const products = productsData?.data?.data || []
    const totalPages = Math.ceil((productsData?.data?.total || 0) / 20)

    const handlePageChange = (newPage: number) => {
        setQueryState({ p: newPage })
    }

    return (
        <main>
            <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[70lvh]">
                <div className="pt-10 pb-6">
                    <h1 className="text-3xl font-bold font-heading tracking-tight">
                        Livestock Feed Products
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Browse our complete collection of livestock feed products across all categories and animal types.
                    </p>
                </div>

                <div className="lg:flex lg:space-x-10">
                    <div className="hidden lg:block lg:w-64 relative">
                        <FeedFilterSidebar />
                    </div>

                    <div className="lg:flex-1">
                        <div className="lg:hidden mb-6">
                            <FeedFilterSidebar />
                        </div>

                        {/* Main Content */}
                        {productsLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="bg-card border border-border rounded-lg overflow-hidden">
                                            <div className="p-4 space-y-3">
                                                <div className="h-3 bg-muted rounded w-1/3" />
                                                <div className="h-4 bg-muted rounded w-4/5" />
                                                <div className="h-4 bg-muted rounded w-3/5" />
                                                <div className="flex gap-2 pt-1">
                                                    <div className="h-5 bg-muted rounded-full w-14" />
                                                    <div className="h-5 bg-muted rounded-full w-14" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No feed products found matching your filters.</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {products.map((product: any) => (
                                        <Link
                                            key={product.id}
                                            href={`/feeds/${product.slug}`}
                                            className="bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/50 group"
                                        >
                                            <div className="p-4 space-y-2">
                                                {product.brand && (
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                                                        {product.brand.name}
                                                    </p>
                                                )}
                                                <h3 className="font-semibold text-sm leading-tight capitalize line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                                                    {product.name}
                                                </h3>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {product.animal && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10 dark:bg-amber-950/30 dark:text-amber-400">
                                                            {product.animal}
                                                        </span>
                                                    )}
                                                    {product.phase && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/10 dark:bg-blue-950/30 dark:text-blue-400">
                                                            {product.phase}
                                                        </span>
                                                    )}
                                                    {product.form && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/10 dark:bg-green-950/30 dark:text-green-400">
                                                            {product.form}
                                                        </span>
                                                    )}
                                                    {product.sub_type && (
                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/10 dark:bg-violet-950/30 dark:text-violet-400">
                                                            {product.sub_type}
                                                        </span>
                                                    )}
                                                </div>
                                                {product.show_price && product.sale_price > 0 && (
                                                    <div className="flex items-center gap-2 pt-1">
                                                        <span className="text-xs text-muted-foreground">Price:</span>
                                                        {product.was_price > 0 && product.was_price > product.sale_price && (
                                                            <span className="text-xs text-muted-foreground line-through">${product.was_price.toFixed(2)}</span>
                                                        )}
                                                        <span className="text-sm font-semibold text-primary">${product.sale_price.toFixed(2)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
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
                    </div>
                </div>
            </div>
        </main>
    )
}
