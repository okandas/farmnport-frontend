"use client"

import { use } from "react"
import { useQuery } from "@tanstack/react-query"
import { queryAnimalHealthProductsByCategory } from "@/lib/query"
import { Button } from "@/components/ui/button"
import { Beaker } from "lucide-react"
import { AnimalHealthFilterSidebar } from "@/components/generic/animalHealthFilterSidebar"
import { AnimalHealthCard } from "@/components/animalhealth/AnimalHealthCard"
import { useQueryStates, parseAsArrayOf, parseAsString, parseAsInteger } from "nuqs"
import Link from "next/link"

interface CategoryPageProps {
    params: Promise<{
        category: string
    }>
}

export default function AnimalHealthCategoryPage({ params }: CategoryPageProps) {
    const { category } = use(params)

    const [queryState, setQueryState] = useQueryStates({
        brand: parseAsArrayOf(parseAsString),
        target: parseAsArrayOf(parseAsString),
        active_ingredient: parseAsArrayOf(parseAsString),
        p: parseAsInteger.withDefault(1),
    })

    const { data: productsData, isLoading: productsLoading } = useQuery({
        queryKey: ["animal-health-category", category, queryState.p, queryState.brand, queryState.target, queryState.active_ingredient],
        queryFn: () => queryAnimalHealthProductsByCategory({
            category,
            p: queryState.p,
            brand: queryState.brand || [],
            target: queryState.target || [],
            active_ingredient: queryState.active_ingredient || [],
        }),
        refetchOnWindowFocus: false,
    })

    const products = productsData?.data?.data || []
    const totalPages = Math.ceil((productsData?.data?.total || 0) / 20)
    const categoryName = products[0]?.animal_health_category?.name || category

    const handlePageChange = (newPage: number) => {
        setQueryState({ p: newPage })
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            {/* Breadcrumb */}
            <div className="border-b bg-muted/30">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/animal-health-guides/all" className="hover:text-foreground">Guides</Link>
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
                        Browse our collection of {typeof categoryName === 'string' ? categoryName.toLowerCase() : category} products for poultry and livestock
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-64 flex-shrink-0">
                        <AnimalHealthFilterSidebar />
                    </aside>

                    {/* Main Content */}
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
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-12">
                                <Beaker className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground mb-4">No {typeof categoryName === 'string' ? categoryName.toLowerCase() : ''} products found matching your filters.</p>
                                <Link href="/animal-health-guides/all">
                                    <Button variant="outline">View All Animal Health Products</Button>
                                </Link>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {products.map((product: any) => (
                                        <AnimalHealthCard
                                            key={product.id}
                                            product={product}
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
            </div>
        </div>
    )
}
