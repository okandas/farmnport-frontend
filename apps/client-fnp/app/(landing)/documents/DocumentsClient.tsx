"use client"

import { useQuery } from "@tanstack/react-query"
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs"
import { FileText, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
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

    return (
        <div>
            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-6">
                {CATEGORIES.map(c => (
                    <button
                        key={c.value}
                        onClick={() => setQs({ category: c.value, p: 1 })}
                        className={`text-sm px-4 py-1.5 rounded-full border font-medium transition-colors ${
                            qs.category === c.value
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border hover:bg-muted"
                        }`}
                    >
                        {c.label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            ) : docs.length === 0 ? (
                <div className="text-center py-20 space-y-3">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground/40" />
                    <p className="font-semibold">No documents found</p>
                    <p className="text-sm text-muted-foreground">Try a different category.</p>
                </div>
            ) : (
                <>
                    <p className="text-sm text-muted-foreground mb-4">Showing {docs.length} of {total}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                        {docs.map((doc: any) => (
                            <DocumentCard key={doc.id} doc={doc} />
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
                                                onClick={() => { setQs({ p: n }); window.scrollTo({ top: 0, behavior: "smooth" }) }}
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
        </div>
    )
}

function DocumentCard({ doc }: { doc: any }) {
    const price = doc.price_cents ? `$${(doc.price_cents / 100).toFixed(2)}` : "Free"

    return (
        <Link href={`/documents/${doc.slug}`} className="group flex flex-col rounded-lg border border-border bg-card hover:shadow-md transition-shadow overflow-hidden">
            {/* Cover */}
            {doc.preview_images?.[0] ? (
                <img src={doc.preview_images[0]} alt={doc.title} className="w-full aspect-[3/4] object-cover" />
            ) : (
                <div className="w-full aspect-[3/4] bg-muted/30 flex items-center justify-center">
                    <FileText className="w-10 h-10 text-muted-foreground/40" />
                </div>
            )}
            <div className="p-3 flex flex-col gap-1.5">
                {doc.category && (
                    <span className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">{doc.category.replace("-", " ")}</span>
                )}
                <p className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{doc.title}</p>
                <p className="text-sm font-bold text-primary mt-auto">{price}</p>
            </div>
        </Link>
    )
}
