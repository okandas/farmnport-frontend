"use client"

import { useQuery } from "@tanstack/react-query"
import { queryAllDocuments } from "@/lib/query"
import Link from "next/link"
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs"
import { FileText, Download } from "lucide-react"

const CATEGORIES = [
    { value: "", label: "All" },
    { value: "rural_infrastructure", label: "Rural Infrastructure" },
    { value: "financial_planning", label: "Financial Planning" },
    { value: "agronomy", label: "Agronomy" },
    { value: "livestock", label: "Livestock" },
]

interface BuyDocumentsClientProps {
    initialDocuments: any[]
    initialTotal: number
}

function DocumentCard({ doc }: { doc: any }) {
    const price = doc.price_cents ? `$${(doc.price_cents / 100).toFixed(2)}` : "Free"
    const preview = doc.preview_images?.[0]

    return (
        <Link
            href={`/buy-documents/${doc.slug}`}
            className="group flex flex-col rounded-xl border border-border bg-card hover:border-primary hover:shadow-md transition-all overflow-hidden"
        >
            {preview ? (
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img src={preview} alt={doc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
            ) : (
                <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                    <FileText className="w-12 h-12 text-muted-foreground/40" />
                </div>
            )}
            <div className="p-4 flex flex-col gap-2 flex-1">
                {doc.category && (
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {doc.category.replace(/_/g, " ")}
                    </span>
                )}
                <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-snug">
                    {doc.title}
                </h3>
                {doc.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {doc.description}
                    </p>
                )}
                <div className="flex items-center justify-between mt-auto pt-2">
                    <span className="text-base font-bold text-primary">{price}</span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Download className="w-3.5 h-3.5" />
                        <span className="uppercase">{doc.file_type || "pdf"}</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}

function DocumentCardSkeleton() {
    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
            <div className="aspect-[4/3] bg-muted" />
            <div className="p-4 flex flex-col gap-2">
                <div className="h-3 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-2/3" />
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
        <div className="flex flex-col gap-6">
            {/* Category filter */}
            <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.value}
                        onClick={() => setQueryState({ category: cat.value, p: 1 })}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                            queryState.category === cat.value
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {[...Array(8)].map((_, i) => <DocumentCardSkeleton key={i} />)}
                </div>
            ) : documents.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p>No documents found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {documents.map((doc: any) => (
                        <DocumentCard key={doc.id} doc={doc} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 pt-4">
                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setQueryState({ p: i + 1 })}
                            className={`w-9 h-9 rounded-lg text-sm font-medium border transition-colors ${
                                queryState.p === i + 1
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "border-border text-muted-foreground hover:border-primary"
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
