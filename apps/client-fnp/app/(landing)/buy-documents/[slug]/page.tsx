import { notFound } from "next/navigation"
import Link from "next/link"
import { Tag, Download, ShieldCheck, RotateCcw, Hash, FileText } from "lucide-react"
import { ShareBar } from "@/components/shared/ShareBar"
import { serverFetch } from "@/lib/serverFetch"
import { guardTestItem } from "@/lib/guardTestItem"
import { documentsEnabled } from "@/flags"
import { DocumentPricingPanel } from "@/components/shop/DocumentPricingPanel"
import { Badge } from "@/components/ui/badge"
import { ProductImageGallery } from "@/components/shared/ProductImageGallery"
import ReactMarkdown from "react-markdown"

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
    const showDocuments = await documentsEnabled()
    if (!showDocuments) notFound()
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
                <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">

                    {/* Left col: image + description */}
                    <div className="space-y-6">
                        <div className="relative">
                            <ProductImageGallery
                                images={allImages.map((src: string) => ({ img: { src } }))}
                                name={doc.title}
                                fallback={<FileText className="w-24 h-24 text-muted-foreground/20" />}
                            />
                            {doc.is_test && (
                                <span className="absolute top-2 left-20 bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md z-10">
                                    Test Item
                                </span>
                            )}
                        </div>

                        {doc.description && (
                            <div className="flex gap-2">
                                {allImages.length > 1 && <div className="w-16 shrink-0" />}
                                <div className="flex-1">
                                    <p className="text-lg font-semibold mb-3">Description</p>
                                    <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none text-muted-foreground
                                        prose-headings:text-sm prose-headings:text-muted-foreground prose-headings:font-normal
                                        [&_strong]:!font-normal [&_strong]:text-foreground [&_p>strong]:block [&_p>strong]:mt-4 [&_p>strong]:mb-1 [&_p>strong]:text-base
                                        prose-ul:my-2 prose-li:my-0.5
                                        prose-p:leading-relaxed prose-p:my-2">
                                        <ReactMarkdown>{doc.description}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right col: title + price card + file meta + what you get */}
                    <div className="sticky top-20 space-y-6">
                        <div className="space-y-3">
                            {doc.category && (
                                <span className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
                                    {doc.category.replace(/-/g, " ")}
                                </span>
                            )}
                            <h1 className="text-2xl font-bold leading-snug">{doc.title}</h1>
                            {doc.brand?.name && (
                                <p className="text-sm text-muted-foreground font-medium">{doc.brand.name}</p>
                            )}
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
                            <ShareBar name={doc.title} />
                        </div>

                        <DocumentPricingPanel
                            docId={doc.id}
                            docSlug={slug}
                            docTitle={doc.title}
                            priceCents={doc.price_cents}
                            price={price}
                        />

                        {/* File meta */}
                        <div className="space-y-4 pt-2">
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
                    </div>

                </div>
            </div>
        </div>
    )
}
