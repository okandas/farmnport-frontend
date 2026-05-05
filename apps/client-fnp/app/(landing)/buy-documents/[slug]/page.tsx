import { queryDocument } from "@/lib/query"
import { notFound } from "next/navigation"
import { AddToCartButton } from "@/components/cart/AddToCartButton"
import { FileText, Download, Tag } from "lucide-react"

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params
    try {
        const res = await queryDocument(slug)
        const doc = res?.data?.document
        return {
            title: `${doc?.title} | farm&port`,
            description: doc?.description,
        }
    } catch {
        return { title: "Document | farm&port" }
    }
}

export default async function DocumentDetailPage({ params }: Props) {
    const { slug } = await params
    let doc: any = null

    try {
        const res = await queryDocument(slug)
        doc = res?.data?.document
    } catch {
        notFound()
    }

    if (!doc) notFound()

    const price = doc.price_cents ? doc.price_cents / 100 : null
    const displayPrice = price ? `$${price.toFixed(2)}` : "Free"

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="mx-auto max-w-5xl px-6 lg:px-8 py-12">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                    <a href="/buy" className="hover:text-foreground transition-colors">Shop</a>
                    <span>/</span>
                    <a href="/buy-documents" className="hover:text-foreground transition-colors">Documents</a>
                    <span>/</span>
                    <span className="text-foreground font-medium">{doc.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Preview */}
                    <div className="flex flex-col gap-4">
                        {doc.preview_images?.length > 0 ? (
                            <div className="rounded-xl overflow-hidden border border-border bg-muted">
                                <img
                                    src={doc.preview_images[0]}
                                    alt={doc.title}
                                    className="w-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="aspect-[4/3] rounded-xl border border-border bg-muted flex items-center justify-center">
                                <FileText className="w-20 h-20 text-muted-foreground/30" />
                            </div>
                        )}
                        {doc.preview_images?.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {doc.preview_images.slice(1).map((src: string, i: number) => (
                                    <div key={i} className="aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                                        <img src={src} alt="" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col gap-6">
                        {doc.category && (
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                                {doc.category.replace(/_/g, " ")}
                            </span>
                        )}

                        <h1 className="text-3xl font-bold tracking-tight font-heading">{doc.title}</h1>

                        {doc.description && (
                            <p className="text-muted-foreground leading-relaxed">{doc.description}</p>
                        )}

                        {/* File info */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                                <Download className="w-4 h-4" />
                                <span className="uppercase font-medium">{doc.file_type || "PDF"}</span>
                            </div>
                            {doc.file_size_bytes > 0 && (
                                <span>{(doc.file_size_bytes / 1024 / 1024).toFixed(1)} MB</span>
                            )}
                        </div>

                        {/* Tags */}
                        {doc.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {doc.tags.map((tag: string) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs text-muted-foreground"
                                    >
                                        <Tag className="w-3 h-3" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Price + CTA */}
                        <div className="border-t border-border pt-6 flex flex-col gap-4">
                            <div className="text-4xl font-bold text-primary">{displayPrice}</div>
                            <AddToCartButton
                                productId={doc.id}
                                productType="document"
                                productName={doc.title}
                                productSlug={doc.slug}
                                imageSrc={doc.preview_images?.[0]}
                                unitPrice={price}
                                loginRedirect={`/buy-documents/${doc.slug}`}
                            />
                            <p className="text-xs text-muted-foreground text-center">
                                Download link available in your account after purchase.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
