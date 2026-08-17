import Image from "next/image"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { AdSenseInFeed } from "@/components/ads/AdSenseInFeed"
import { SidebarPromo } from "@/components/ads/SidebarPromo"
import { WantToBuyCTA } from "@/components/shared/WantToBuyCTA"
import { GuideProductTitle } from "@/components/shared/GuideProductTitle"
import { ShareBar } from "@/components/shared/ShareBar"

interface BreadcrumbItem {
    label: string
    href: string
}

interface GuideDetailLayoutProps {
    product: any
    breadcrumbs: BreadcrumbItem[]
    categoryBadge?: { label: string; color?: "blue" | "green" }
    buyHref: string
    interestHref: string
    safetyText: string
    disclaimerText?: string
    structuredData?: object
    breadcrumbJsonLd?: object
    /** Precautions array — defaults to product.precautions */
    precautions?: string[]
    /** Safety warnings as a single string (feeds use this instead of precautions array) */
    safetyWarnings?: string
    /** Content rendered after the safety warning (related products, etc.) */
    afterContent?: React.ReactNode
    /** Content for the right column (overview, AI, targets, specs, etc.) */
    children: React.ReactNode
    /** Content below the 2-column grid (dosage tables, planting guides, etc.) */
    bottomContent?: React.ReactNode
    /** Extra content before the breadcrumb (e.g. SprayProgramBackLink) */
    topContent?: React.ReactNode
    /** Replace the default breadcrumb with a custom one (e.g. FeedBreadcrumb) */
    customBreadcrumb?: React.ReactNode
}

export function GuideDetailLayout({
    product,
    breadcrumbs,
    categoryBadge,
    buyHref,
    interestHref,
    safetyText,
    disclaimerText,
    structuredData,
    breadcrumbJsonLd,
    precautions,
    safetyWarnings,
    children,
    bottomContent,
    topContent,
    customBreadcrumb,
    afterContent,
}: GuideDetailLayoutProps) {
    const resolvedPrecautions = precautions ?? product.precautions

    return (
        <div className="min-h-screen bg-background">
            {breadcrumbJsonLd && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
            )}
            {structuredData && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            )}

            {topContent}

            {/* Breadcrumb */}
            {customBreadcrumb || (
                <div className="border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <nav className="flex flex-wrap text-sm text-muted-foreground">
                            <Link href="/" className="hover:text-foreground">Home</Link>
                            {breadcrumbs.map((crumb, idx) => (
                                <span key={idx} className="contents">
                                    <span className="mx-2">/</span>
                                    {idx === breadcrumbs.length - 1 ? (
                                        <span className="text-foreground capitalize truncate max-w-[200px] sm:max-w-none">{crumb.label}</span>
                                    ) : (
                                        <Link href={crumb.href} className="hover:text-foreground capitalize">{crumb.label}</Link>
                                    )}
                                </span>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section — 2 column grid */}
                <div className="grid lg:grid-cols-[450px,1fr] gap-6 lg:gap-12 mb-6">
                    {/* Left — Image + CTA + Precautions + Promo */}
                    <div className="flex flex-col gap-4">
                        <div className="relative aspect-square bg-muted/30 dark:bg-white rounded-xl border overflow-hidden shadow-sm">
                            {product.images?.[0]?.img?.src ? (
                                <Image
                                    src={product.images[0].img.src}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 450px"
                                    className="object-contain p-8"
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 bg-muted/30" />
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-3">
                                {product.images.slice(0, 4).map((img: any, idx: number) => (
                                    <div key={idx} className="relative aspect-square bg-muted/30 dark:bg-white rounded-lg border hover:border-primary transition-colors">
                                        {img.img?.src && (
                                            <Image
                                                src={img.img.src}
                                                alt={`${product.name} ${idx + 1}`}
                                                fill
                                                sizes="(max-width: 1024px) 25vw, 100px"
                                                className="object-contain p-2"
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Precautions (array) */}
                        {resolvedPrecautions && resolvedPrecautions.length > 0 && (
                            <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/30 px-3 py-2">
                                <h2 className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-400 mb-1.5 flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    Precautions
                                </h2>
                                <ul className="space-y-0.5">
                                    {resolvedPrecautions.map((precaution: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-1.5 text-xs text-red-800 dark:text-red-300">
                                            <span className="h-1 w-1 rounded-full bg-red-500 dark:bg-red-400 flex-shrink-0 mt-1.5" />
                                            <span>{precaution}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Safety warnings (string — used by feeds) */}
                        {safetyWarnings && (
                            <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/30 px-3 py-2">
                                <h2 className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-400 mb-1.5 flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    Safety Warning
                                </h2>
                                <p className="text-xs text-red-800 dark:text-red-300 whitespace-pre-line">{safetyWarnings}</p>
                            </div>
                        )}

                        {/* Promo */}
                        <div className="flex-1">
                            <SidebarPromo />
                        </div>
                    </div>

                    {/* Right — Product Info */}
                    <div className="space-y-6">
                        <GuideProductTitle name={product.name} brand={product.brand?.name} />
                        <div className="mt-3 flex items-center flex-wrap gap-3">
                            {categoryBadge && (
                                <span className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                                    categoryBadge.color === "green"
                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                }`}>
                                    {categoryBadge.label}
                                </span>
                            )}
                            <ShareBar name={product.name} />
                        </div>

                        <div className="h-px bg-border" />

                        {/* Page-specific content */}
                        {children}

                        <AdSenseInFeed />
                    </div>
                </div>

                {afterContent}

                {/* Below the grid — dosage tables, planting guides, etc. */}
                {bottomContent}

                {/* Product Labels */}
                {(product.front_label?.img?.src || product.back_label?.img?.src) && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-6">Product Labels</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {product.front_label?.img?.src && (
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold">Front Label</h3>
                                    <div className="relative aspect-[3/4] bg-white rounded-lg border overflow-hidden">
                                        <Image
                                            src={product.front_label.img.src}
                                            alt={`${product.name} - Front Label`}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            className="object-contain p-4"
                                        />
                                    </div>
                                </div>
                            )}
                            {product.back_label?.img?.src && (
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold">Back Label</h3>
                                    <div className="relative aspect-[3/4] bg-white rounded-lg border overflow-hidden">
                                        <Image
                                            src={product.back_label.img.src}
                                            alt={`${product.name} - Back Label`}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            className="object-contain p-4"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Safety Warning / Disclaimer */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold mb-2 text-yellow-900 dark:text-yellow-100">Safety Information</h3>
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">{safetyText}</p>
                            {disclaimerText && (
                                <p className="text-xs text-black dark:text-white mt-2">{disclaimerText}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
