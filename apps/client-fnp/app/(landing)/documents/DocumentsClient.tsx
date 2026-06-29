"use client"

import { useQuery } from "@tanstack/react-query"
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs"
import { FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/shared/ProductCard"
import { listDocuments } from "@/lib/query"

const CATEGORIES = [
    { value: "", label: "All" },
    { value: "spray-program", label: "Spray Programs" },
    { value: "guide", label: "Guides" },
    { value: "datasheet", label: "Datasheets" },
    { value: "catalogue", label: "Catalogues" },
]

interface DocumentsClientProps {
    initialDocs: any[]
    initialTotal: number
}

export function DocumentsClient({ initialDocs, initialTotal }: DocumentsClientProps) {
    const [qs, setQs] = useQueryStates({
        category: parseAsString.withDefault(""),
        p: parseAsInteger.withDefault(1),
    })

    const hasFilters = qs.category !== "" || qs.p > 1

    const { data, isLoading } = useQuery({
        queryKey: ["documents", qs.category, qs.p],
        queryFn: () => listDocuments(qs.category || undefined).then(r => r.data),
        placeholderData: !hasFilters ? { documents: initialDocs, total: initialTotal } as any : undefined,
        refetchOnWindowFocus: false,
    })

    const docs: any[] = data?.documents ?? []
    const total: number = data?.total ?? 0
    const totalPages = Math.ceil(total / 24)

    const handlePageChange = (newPage: number) => {
        setQs({ p: newPage })
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full lg:w-64 flex-shrink-0">
                <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Category</p>
                    {CATEGORIES.map(c => (
                        <button
                            key={c.value}
                            onClick={() => setQs({ category: c.value, p: 1 })}
                            className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
                                qs.category === c.value
                                    ? "bg-primary text-primary-foreground font-medium"
                                    : "hover:bg-muted text-foreground"
                            }`}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1">
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-card border border-border rounded-lg overflow-hidden">
                                    <div className="aspect-[3/4] bg-muted" />
                                    <div className="p-4 space-y-3 border-t">
                                        <div className="h-3 bg-muted rounded w-1/3" />
                                        <div className="h-4 bg-muted rounded w-4/5" />
                                        <div className="h-10 bg-muted rounded mt-4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : docs.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
                        <p className="text-muted-foreground">No documents found.</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4 text-sm text-muted-foreground">
                            Showing {docs.length} of {total} documents
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {docs.map((doc: any) => (
                                <ProductCard
                                    key={doc.id}
                                    href={`/documents/${doc.slug}`}
                                    imageSrc={doc.preview_images?.[0]}
                                    name={doc.title}
                                    meta={doc.category?.replace("-", " ")}
                                    mode="buy"
                                    productId={doc.id}
                                    productType="document"
                                    productSlug={doc.slug}
                                    salePrice={doc.price_cents}
                                    availableForSale={doc.active}
                                    loginRedirect={`/documents/${doc.slug}`}
                                />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <div className="mt-8 flex justify-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(n => n === 1 || n === totalPages || (n >= qs.p - 2 && n <= qs.p + 2))
                                    .map((n, idx, arr) => {
                                        const prev = arr[idx - 1]
                                        return (
                                            <div key={n} className="flex items-center gap-1">
                                                {prev && n - prev > 1 && <span className="px-2 text-muted-foreground">...</span>}
                                                <Button
                                                    variant={qs.p === n ? "default" : "outline"}
                                                    size="sm"
                                                    className="min-w-[40px]"
                                                    onClick={() => handlePageChange(n)}
                                                >
                                                    {n}
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
