"use client"

import { useQuery } from "@tanstack/react-query"
import { queryAllDocuments } from "@/lib/query"
import Link from "next/link"
import Image from "next/image"
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs"
import { FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AddToCartButton } from "@/components/cart/AddToCartButton"
import { BuyCategoriesNav } from "@/components/generic/BuyCategoriesNav"
import { DocumentFilterSidebar } from "@/components/generic/documentFilterSidebar"

interface BuyDocumentsClientProps {
    initialDocuments: any[]
    initialTotal: number
}

function DocumentCard({ doc }: { doc: any }) {
    const price = doc.price_cents ? `$${(doc.price_cents / 100).toFixed(2)}` : "Free"
    const preview = doc.preview_images?.[0]
    const href = `/buy-documents/${doc.slug}`

    return (
        <div className="bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/50 group">
            <Link href={href} className="block">
                <div className="relative aspect-square bg-muted/20">
                    {preview ? (
                        <Image
                            src={preview}
                            alt={doc.title}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                            <FileText className="w-16 h-16 text-muted-foreground/30" />
                        </div>
                    )}
                </div>
            </Link>

            <div className="p-4 space-y-3 border-t">
                {doc.category && (
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                        {doc.category.replace(/_/g, " ")}
                    </p>
                )}

                <Link href={href}>
                    <h3 className="font-semibold text-sm leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                        {doc.title}
                    </h3>
                </Link>

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5" />
                        <span className="uppercase">{doc.file_type || "pdf"}</span>
                    </div>
                    {doc.show_price && doc.price_cents > 0 ? (
                        <span className="text-sm font-bold text-primary">{price}</span>
                    ) : (
                        <span className="text-sm font-bold text-primary">Free</span>
                    )}
                </div>

                <AddToCartButton
                    productId={doc.id}
                    productType="document"
                    productName={doc.title}
                    productSlug={doc.slug}
                    imageSrc={preview}
                    unitPrice={doc.price_cents > 0 ? doc.price_cents : null}
                    loginRedirect={href}
                />
            </div>
        </div>
    )
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

export function BuyDocumentsClient({ initialDocuments, initialTotal }: BuyDocumentsClientProps) {
    const [queryState, setQueryState] = useQueryStates({
        category: parseAsString.withDefault(""),
        p: parseAsInteger.withDefault(1),
    })

    const hasFilters = !!queryState.category || queryState.p > 1

    const { data, isLoading } = useQuery({
        queryKey: ["documents-shop", queryState.p, queryState.category],
        queryFn: () => queryAllDocuments({ p: queryState.p, category: queryState.category || undefined }),
        refetchOnWindowFocus: false,
        placeholderData: !hasFilters ? { data: { documents: initialDocuments, total: initialTotal } } as any : undefined,
    })

    const documents = data?.data?.documents || []
    const total = data?.data?.total || 0
    const totalPages = Math.ceil(total / 24)

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0">
                <BuyCategoriesNav />
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
                                <DocumentCard key={doc.id} doc={doc} />
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
                                                    onClick={() => setQueryState({ p: pageNum })}
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
