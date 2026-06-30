import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Tag, Download, FileText } from "lucide-react"
import { serverFetch } from "@/lib/serverFetch"
import { Badge } from "@/components/ui/badge"
import { AdSenseInFeed } from "@/components/ads/AdSenseInFeed"
import { WantToBuyCTA } from "@/components/shared/WantToBuyCTA"

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    try {
        const { slug } = await params
        const result = await serverFetch(`/documents/${slug}`)
        const doc = result?.document
        if (!doc) return {}
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://farmnport.com"
        return {
            title: `${doc.title} | Farmnport Documents`,
            description: doc.description || `Download ${doc.title} — a digital document available on farmnport.com.`,
            openGraph: {
                title: doc.title,
                description: doc.description,
                images: doc.main_image ? [{ url: doc.main_image }] : [],
                url: `${baseUrl}/documents/${slug}`,
            },
        }
    } catch {
        return {}
    }
}

export default async function DocumentGuidePage({ params }: Props) {
    const { slug } = await params
    let doc: any = null

    try {
        const result = await serverFetch(`/documents/${slug}`)
        doc = result?.document
    } catch {
        notFound()
    }

    if (!doc) notFound()

    const fileSizeKB = doc.file_size_bytes ? Math.round(doc.file_size_bytes / 1024) : null
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://farmnport.com"

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": doc.title,
        "description": doc.description || doc.title,
        "image": doc.main_image || undefined,
        "url": `${baseUrl}/documents/${slug}`,
        "category": doc.category?.replace(/-/g, " ") || "Document",
        "offers": doc.price_cents ? {
            "@type": "Offer",
            "price": (doc.price_cents / 100).toFixed(2),
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
        } : undefined,
    }

    return (
        <div className="min-h-screen bg-background">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            {/* Breadcrumb */}
            <div className="border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/documents" className="hover:text-foreground transition-colors">Documents</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground truncate">{doc.title}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-[450px,1fr] gap-12 mb-16">

                    {/* Left — Image */}
                    <div className="space-y-4">
                        <div className="relative aspect-square bg-white rounded-xl border overflow-hidden shadow-sm">
                            {doc.main_image ? (
                                <Image
                                    src={doc.main_image}
                                    alt={doc.title}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 450px"
                                    className="object-contain p-8"
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <FileText className="w-24 h-24 text-muted-foreground/20" />
                                </div>
                            )}
                        </div>

                        {/* Buy CTA */}
                        <WantToBuyCTA
                            available_for_sale={!!doc.price_cents}
                            name={doc.title}
                            href={`/buy-documents/${slug}`}
                            interestHref={`/interest/document/${slug}`}
                        />
                    </div>

                    {/* Right — Info */}
                    <div className="space-y-6">
                        {doc.category && (
                            <span className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
                                {doc.category.replace(/-/g, " ")}
                            </span>
                        )}

                        <h1 className="text-2xl lg:text-3xl font-bold leading-snug">{doc.title}</h1>

                        <div className="h-px bg-border" />

                        {doc.description && (
                            <div>
                                <h2 className="text-lg font-semibold mb-3">Overview</h2>
                                <p className="text-muted-foreground leading-relaxed text-sm">{doc.description}</p>
                            </div>
                        )}

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

                        <AdSenseInFeed />
                    </div>
                </div>
            </div>
        </div>
    )
}
