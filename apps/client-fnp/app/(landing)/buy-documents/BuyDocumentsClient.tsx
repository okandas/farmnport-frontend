"use client"

import { useQuery } from "@tanstack/react-query"
import { queryAllDocuments } from "@/lib/query"
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/shared/ProductCard"
import { BuyCategoriesNavClient } from "@/components/generic/BuyCategoriesNavClient"
import { DocumentFilterSidebar } from "@/components/generic/documentFilterSidebar"

interface BuyDocumentsClientProps {
    initialDocuments: any[]
    initialTotal: number
    categories: { label: string; href: string }[]
}


function DocumentCardSkeleton() {
    return (
        <div className="animate-pulse">
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
    )
}

export function BuyDocumentsClient({ initialDocuments, initialTotal, categories }: BuyDocumentsClientProps) {
    const [queryState, setQueryState] = useQueryStates({
        category: parseAsString.withDefault(""),
        p: parseAsInteger.withDefault(1),
    })

    const hasFilters = !!queryState.category || queryState.p > 1

    const { data, isLoading } = useQuery({
        queryKey: ["documents-shop", queryState.p, queryState.category],
        queryFn: () => queryAllDocuments({ p: queryState.p, category: queryState.category || undefined }),
        refetchOnWindowFocus: false,
        placeholderData: !hasFilters ? { data: { data: initialDocuments, total: initialTotal } } as any : undefined,
    })

    const documents = data?.data?.data || []
    const total = data?.data?.total || 0
    const totalPages = Math.ceil(total / 24)

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0">
                <BuyCategoriesNavClient categories={categories} />
                <DocumentFilterSidebar />
            </aside>

            {/* Main Content */}
            <main className="flex-1">
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {[...Array(6)].map((_, i) => <DocumentCardSkeleton key={i} />)}
                    </div>
                ) : documents.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">No documents found.</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 text-sm text-muted-foreground">
                            Showing {documents.length} of {total} documents
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {documents.map((doc: any) => (
                                <ProductCard
                                    key={doc.id}
                                    mode="buy"
                                    href={`/buy-documents/${doc.slug}`}
                                    imageSrc={doc.main_image}
                                    name={doc.title}
                                    meta={doc.category?.replace(/_/g, " ")}
                                    productId={doc.id}
                                    productType="document"
                                    productSlug={doc.slug}
                                    salePrice={doc.price_cents > 0 ? doc.price_cents : undefined}
                                    availableForSale={true}
                                    loginRedirect={`/buy-documents/${doc.slug}`}
                                    isTest={doc.is_test}
                                    singleUnit
                                    imageFill={doc.image_fill}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center gap-1 flex-wrap">
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
                                                    onClick={() => { setQueryState({ p: pageNum }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
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
