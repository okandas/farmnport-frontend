import { serverFetch } from "@/lib/serverFetch"
import Image from "next/image"
import Link from "next/link"
import { WantToBuyCTA } from "@/components/shared/WantToBuyCTA"
import { GuideProductTitle } from "@/components/shared/GuideProductTitle"
import { formatProductName } from "@/lib/utilities"

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params
    const product = await serverFetch(`/seed-products/${slug}`).catch(() => null)
    if (!product) return {}
    const variety = product.variety ? ` — ${product.variety}` : ""
    return {
        title: `${formatProductName(product.name)}${variety} – Seed Guide | farmnport.com`,
        description: product.description || `${product.name}${variety} certified seed variety guide. Planting season, days to maturity, yield potential, and growing guide.`,
        alternates: { canonical: `/seed-guides/${slug}` },
        openGraph: {
            title: `${formatProductName(product.name)} – Seed Guide`,
            description: product.description || `${product.name}${variety} seed variety guide.`,
            siteName: "farmnport",
            type: "website",
        },
    }
}

export default async function SeedGuidePage({ params }: Props) {
    const { slug } = await params
    const product = await serverFetch(`/seed-products/${slug}`).catch(() => null)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://farmnport.com"

    if (!product) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Guide Not Found</h2>
                    <p className="text-muted-foreground">The seed guide you&apos;re looking for doesn&apos;t exist.</p>
                    <Link href="/seed-guides" className="text-sm text-primary underline mt-4 block">Back to Seed Guides</Link>
                </div>
            </div>
        )
    }

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.images?.[0]?.img?.src || `${baseUrl}/default-product.png`,
        "description": product.description || `${product.name}${product.variety ? ` — ${product.variety}` : ""}`,
        "sku": product.id || slug,
        "brand": { "@type": "Brand", "name": product.brand?.name || "farmnport" },
    }

    const hasPlantingGuide = product.planting_guide?.length > 0
    const categoryLabel = [product.variety, product.type?.replace("_", " ")].filter(Boolean).join(" · ")

    return (
        <div className="min-h-screen bg-background">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

            {/* Breadcrumb */}
            <div className="border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/guides" className="hover:text-foreground">Guides</Link>
                        <span className="mx-2">/</span>
                        <Link href="/seed-guides" className="hover:text-foreground">Seed Guides</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground capitalize">{product.name}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="grid lg:grid-cols-[450px,1fr] gap-12 mb-16">
                    {/* Left - Image */}
                    <div className="space-y-4">
                        <div className="relative aspect-square bg-white rounded-xl border overflow-hidden shadow-sm">
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
                                    <div key={idx} className="relative aspect-square bg-white rounded-lg border hover:border-primary transition-colors">
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

                        <WantToBuyCTA available_for_sale={product.available_for_sale} name={product.name} brand={product.brand?.name} href={`/buy-seed-products/${slug}`} interestHref={`/interest/seed/${slug}`} />

                        {/* Precautions */}
                        {product.precautions?.length > 0 && (
                            <div className="rounded-lg border border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/30 px-3 py-2">
                                <h2 className="text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-400 mb-1.5">
                                    Precautions
                                </h2>
                                <ul className="space-y-0.5">
                                    {product.precautions.map((precaution: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-1.5 text-xs text-orange-800 dark:text-orange-300">
                                            <span className="h-1 w-1 rounded-full bg-orange-500 dark:bg-orange-400 flex-shrink-0 mt-1.5" />
                                            <span>{precaution}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Right - Product Info */}
                    <div className="space-y-6">
                        {/* Product Name */}
                        <GuideProductTitle name={product.name} brand={product.brand?.name} />

                        {/* Category Badge */}
                        {categoryLabel && (
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 capitalize">
                                    {categoryLabel}
                                </div>
                            </div>
                        )}

                        <div className="h-px bg-border" />

                        {/* Description / Overview */}
                        {product.description && (
                            <div>
                                <h2 className="text-lg font-semibold mb-3 text-foreground">Overview</h2>
                                <p className="text-muted-foreground leading-relaxed text-sm">{product.description}</p>
                            </div>
                        )}

                        {/* Key Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {product.planting_season && (
                                <div className="rounded-xl border bg-card p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400 mb-1">Planting Season</p>
                                    <p className="text-sm text-foreground">{product.planting_season}</p>
                                </div>
                            )}
                            {product.days_to_maturity && (
                                <div className="rounded-xl border bg-card p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400 mb-1">Days to Maturity</p>
                                    <p className="text-sm text-foreground">{product.days_to_maturity}</p>
                                </div>
                            )}
                            {product.yield_potential && (
                                <div className="rounded-xl border bg-card p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400 mb-1">Yield Potential</p>
                                    <p className="text-sm text-foreground">{product.yield_potential}</p>
                                </div>
                            )}
                            {product.seed_treatment && (
                                <div className="rounded-xl border bg-card p-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400 mb-1">Seed Treatment</p>
                                    <p className="text-sm text-foreground">{product.seed_treatment}</p>
                                </div>
                            )}
                        </div>

                        {/* Soil Requirements */}
                        {product.soil_requirements && (
                            <div>
                                <h2 className="text-lg font-semibold mb-2 text-foreground">Soil Requirements</h2>
                                <p className="text-sm text-muted-foreground leading-relaxed">{product.soil_requirements}</p>
                            </div>
                        )}

                        {/* Management Tips */}
                        {product.management_tips && (
                            <div>
                                <h2 className="text-lg font-semibold mb-2 text-foreground">Management Tips</h2>
                                <p className="text-sm text-muted-foreground leading-relaxed">{product.management_tips}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Planting Guide */}
                {hasPlantingGuide && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-6">Planting Guide</h2>
                        <ol className="space-y-4">
                            {product.planting_guide.map((step: any, i: number) => (
                                <li key={i} className="flex gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">{i + 1}</span>
                                    <div className="pt-1">
                                        <p className="font-medium text-foreground text-sm">{step.step}</p>
                                        {step.notes && <p className="text-muted-foreground text-sm mt-0.5">{step.notes}</p>}
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}
            </div>
        </div>
    )
}
