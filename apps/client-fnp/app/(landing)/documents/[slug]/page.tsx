import { notFound } from "next/navigation"
import Link from "next/link"
import { FileText, Tag, Download } from "lucide-react"
import { serverFetch } from "@/lib/serverFetch"
import { AddToCartButton } from "@/components/cart/AddToCartButton"

interface Props {
    params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
    try {
        const result = await serverFetch(`/documents/${params.slug}`)
        const doc = result?.document
        if (!doc) return {}
        return {
            title: `${doc.title} | Farmnport Documents`,
            description: doc.description,
        }
    } catch {
        return {}
    }
}

export default async function DocumentDetailPage({ params }: Props) {
    let doc: any = null

    try {
        const result = await serverFetch(`/documents/${params.slug}`)
        doc = result?.document
    } catch {
        notFound()
    }

    if (!doc) notFound()

    const price = doc.price_cents ? `$${(doc.price_cents / 100).toFixed(2)}` : "Free"
    const fileSizeKB = doc.file_size_bytes ? Math.round(doc.file_size_bytes / 1024) : null

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="mx-auto max-w-5xl px-6 lg:px-8 py-6">
                <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
                    <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                    <span>/</span>
                    <Link href="/documents" className="hover:text-foreground transition-colors">Documents</Link>
                    <span>/</span>
                    <span className="text-foreground font-medium truncate">{doc.title}</span>
                </nav>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {/* Cover */}
                    <div className="md:col-span-1">
                        {doc.preview_images?.[0] ? (
                            <img
                                src={doc.preview_images[0]}
                                alt={doc.title}
                                className="w-full rounded-xl border border-border shadow-sm object-cover aspect-[3/4]"
                            />
                        ) : (
                            <div className="w-full aspect-[3/4] rounded-xl border border-border bg-muted/30 flex items-center justify-center">
                                <FileText className="w-16 h-16 text-muted-foreground/30" />
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="md:col-span-2 flex flex-col gap-5">
                        {doc.category && (
                            <span className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">
                                {doc.category.replace("-", " ")}
                            </span>
                        )}

                        <h1 className="text-3xl font-bold tracking-tight font-heading">{doc.title}</h1>

                        {doc.description && (
                            <p className="text-muted-foreground leading-relaxed">{doc.description}</p>
                        )}

                        {/* Meta */}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {doc.file_type && (
                                <span className="flex items-center gap-1.5">
                                    <FileText className="w-4 h-4" />
                                    {doc.file_type.toUpperCase()}
                                </span>
                            )}
                            {fileSizeKB && (
                                <span className="flex items-center gap-1.5">
                                    <Download className="w-4 h-4" />
                                    {fileSizeKB < 1024 ? `${fileSizeKB} KB` : `${(fileSizeKB / 1024).toFixed(1)} MB`}
                                </span>
                            )}
                        </div>

                        {doc.tags?.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {doc.tags.map((tag: string) => (
                                    <span key={tag} className="flex items-center gap-1 text-xs bg-muted px-2.5 py-1 rounded-full text-muted-foreground">
                                        <Tag className="w-3 h-3" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Purchase box */}
                        <div className="rounded-xl border border-border bg-card p-5 space-y-4 mt-auto">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold">{price}</span>
                                <span className="text-sm text-muted-foreground">one-time purchase</span>
                            </div>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>✓ Instant digital download</li>
                                <li>✓ Watermarked with your name for security</li>
                                <li>✓ Re-download anytime from your account</li>
                                <li>✓ Includes license serial number</li>
                            </ul>
                            <AddToCartButton
                                productId={doc.id}
                                productType="document"
                                productName={doc.title}
                                productSlug={doc.slug}
                                unitPrice={doc.price_cents}
                                loginRedirect={`/documents/${doc.slug}`}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
