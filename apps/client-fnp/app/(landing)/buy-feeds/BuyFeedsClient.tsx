"use client"

import { useQuery } from "@tanstack/react-query"
import { queryAllFeedProducts } from "@/lib/query"
import { Button } from "@/components/ui/button"
import { FeedFilterSidebar } from "@/components/generic/feedFilterSidebar"
import { useQueryStates, parseAsArrayOf, parseAsString, parseAsInteger } from "nuqs"
import { Egg } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface BuyFeedsClientProps {
    initialProducts: any[]
    initialTotal: number
}

function FeedCard({ product }: { product: any }) {
    const href = `/buy-feeds/${product.slug}`
    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/50 group">
            <Link href={href} className="block">
                <div className="relative aspect-square bg-white">
                    {product.images && product.images[0] && product.images[0].img?.src ? (
                        <Image
                            src={product.images[0].img.src}
                            alt={product.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-contain transition-transform duration-200 group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                            <Egg className="w-16 h-16 text-muted-foreground/30" />
                        </div>
                    )}
                </div>
            </Link>

            <div className="p-4 space-y-3 border-t">
                {product.brand && (
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                        {product.brand.name}
                    </p>
                )}

                <Link href={href}>
                    <h3 className="font-semibold text-sm leading-tight capitalize line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                    {product.animal && (
                        <span className="capitalize">{product.animal}</span>
                    )}
                    {product.phase && (
                        <span className="capitalize">{product.phase}</span>
                    )}
                </div>

                {product.show_price && product.sale_price > 0 && (
                    <div className="flex items-center gap-2">
                        {product.was_price > 0 && product.was_price > product.sale_price && (
                            <span className="text-xs text-muted-foreground line-through">${(product.was_price / 100).toFixed(2)}</span>
                        )}
                        <span className="text-sm font-semibold text-primary">${(product.sale_price / 100).toFixed(2)}</span>
                    </div>
                )}

                <Link href={href} className="block pt-2">
                    <Button variant="outline" className="w-full" size="sm">
                        View Product
                    </Button>
                </Link>
            </div>
        </div>
    )
}

export function BuyFeedsClient({ initialProducts, initialTotal }: BuyFeedsClientProps) {
    const [queryState, setQueryState] = useQueryStates({
        brand: parseAsArrayOf(parseAsString),
        animal: parseAsArrayOf(parseAsString),
        phase: parseAsArrayOf(parseAsString),
        sub_type: parseAsArrayOf(parseAsString),
        p: parseAsInteger.withDefault(1),
    })

    const hasFilters =
        (queryState.brand && queryState.brand.length > 0) ||
        (queryState.animal && queryState.animal.length > 0) ||
        (queryState.phase && queryState.phase.length > 0) ||
        (queryState.sub_type && queryState.sub_type.length > 0) ||
        queryState.p > 1

    const { data: productsData, isLoading: productsLoading } = useQuery({
        queryKey: ["feeds-shop", queryState.p, queryState.brand, queryState.animal, queryState.phase, queryState.sub_type],
        queryFn: () => queryAllFeedProducts({
            p: queryState.p,
            brand: queryState.brand || [],
            animal: queryState.animal || [],
            phase: queryState.phase || [],
            sub_type: queryState.sub_type || [],
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
                <FeedFilterSidebar />
            </aside>

            <main className="flex-1">
                {productsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                        <Egg className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No feed products found matching your filters.</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 text-sm text-muted-foreground">
                            Showing {products.length} of {productsData?.data?.total || 0} products
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {products.map((product: any) => (
                                <FeedCard key={product.id} product={product} />
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
