import { notFound } from "next/navigation"
import Link from "next/link"
import { Tag, Download, ShieldCheck, RotateCcw, Hash, FileText } from "lucide-react"
import { serverFetch } from "@/lib/serverFetch"
import { guardTestItem } from "@/lib/guardTestItem"
import { DocumentPricingPanel } from "@/components/shop/DocumentPricingPanel"
import { Badge } from "@/components/ui/badge"
import { ProductImageGallery } from "@/components/shared/ProductImageGallery"

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
    try {
        const { slug } = await params
        const result = await serverFetch(`/documents/${slug}`)
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

export default async function BuyDocumentDetailPage({ params }: Props) {
    const { slug } = await params
    let doc: any = null

    try {
        const result = await serverFetch(`/documents/${slug}`)
        doc = result?.document
    } catch {
        notFound()
    }

    if (!doc) notFound()
    await guardTestItem(!!doc.is_test)

    const price = doc.price_cents ? `$${(doc.price_cents / 100).toFixed(2)}` : "Free"
    const fileSizeKB = doc.file_size_bytes ? Math.round(doc.file_size_bytes / 1024) : null
    const otherImages: string[] = doc.other_images ?? []
    const allImages = [doc.main_image, ...otherImages].filter(Boolean)

    return (
        <div className="min-h-screen bg-background">
            <div className="border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/buy" className="hover:text-foreground transition-colors">Buy</Link>
                        <span className="mx-2">/</span>
                        <Link href="/buy-documents" className="hover:text-foreground transition-colors">Documents</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground truncate">{doc.title}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-[480px_1fr_300px] gap-8 items-start">

                    {/* Column 1: Image */}
                    <ProductImageGallery
                        images={allImages.map((src: string) => ({ img: { src } }))}
                        name={doc.title}
                        fallback={<FileText className="w-24 h-24 text-muted-foreground/20" />}
                    />

                    {/* Column 2: Details */}
                    <div className="space-y-5">
                        {doc.category && (
                            <span className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
                                {doc.category.replace(/-/g, " ")}
                            </span>
                        )}

                        <h1 className="text-2xl lg:text-3xl font-bold leading-snug">{doc.title}</h1>

                        {doc.description && (
                            <p className="text-muted-foreground leading-relaxed">{doc.description}</p>
                        )}

                        <div className="h-px bg-border" />

                        {/* File meta */}
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {doc.file_type && (
                                <span className="flex items-center gap-1.5">
                                    <FileText className="w-4 h-4" />
                                    {doc.file_type.toUpperCase()} file
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
                                    <Badge key={tag} variant="secondary" className="gap-1 font-normal">
                                        <Tag className="w-3 h-3" />
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <div className="h-px bg-border" />

                        {/* What you get */}
                        <div>
                            <p className="text-sm font-semibold mb-3">What you get</p>
                            <ul className="space-y-2.5 text-sm text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <Download className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
                                    Instant digital download after payment
                                </li>
                                <li className="flex items-start gap-2">
                                    <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
                                    Watermarked with your name for security
                                </li>
                                <li className="flex items-start gap-2">
                                    <RotateCcw className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
                                    Re-download anytime from your account
                                </li>
                                <li className="flex items-start gap-2">
                                    <Hash className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
                                    Unique license serial number included
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Column 3: Sticky pricing panel */}
                    <div className="sticky top-20">
                        <DocumentPricingPanel
                            docId={doc.id}
                            docSlug={slug}
                            docTitle={doc.title}
                            priceCents={doc.price_cents}
                            price={price}
                        />
                    </div>

                </div>
            </div>
        </div>
    )
}
