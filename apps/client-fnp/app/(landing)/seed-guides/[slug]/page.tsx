import { serverFetch } from "@/lib/serverFetch"
import { formatProductName } from "@/lib/utilities"
import { ProductNotFound } from "@/components/shared/ProductNotFound"
import { GuideDetailLayout } from "@/components/shared/GuideDetailLayout"
import { AdSenseInFeed } from "@/components/ads/AdSenseInFeed"
import { RelatedGuideProducts } from "@/components/sections/related-guide-products"

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
        return <ProductNotFound title="Seed Guide Not Found" description="The seed guide you're looking for doesn't exist or may have been removed." primary={{ href: "/seed-guides", label: "Browse Seed Guides" }} secondary={{ href: "/buy-seed-products", label: "Buy Seeds" }} />
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

    const categoryLabel = [product.variety, product.type?.replace("_", " ")].filter(Boolean).join(" · ")
    const hasPlantingGuide = product.planting_guide?.length > 0

    const plantingGuide = hasPlantingGuide ? (
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
    ) : null

    return (
        <GuideDetailLayout
            product={product}
            breadcrumbs={[
                { label: "Seed Guides", href: "/seed-guides" },
                { label: product.name, href: `/seed-guides/${slug}` },
            ]}
            categoryBadge={categoryLabel ? { label: categoryLabel, color: "green" } : undefined}
            buyHref={`/buy-seed-products/${slug}`}
            interestHref={`/interest/seed/${slug}`}
            safetyText="Always follow recommended planting guidelines and seed treatment instructions. Store seeds in a cool, dry place away from direct sunlight."
            structuredData={structuredData}
            bottomContent={plantingGuide}
        >
            {/* Overview */}
            {product.description && (
                <div>
                    <h2 className="text-lg font-semibold mb-3 text-foreground">Overview</h2>
                    <p className="text-muted-foreground leading-relaxed text-sm">{product.description}</p>
                </div>
            )}

            <AdSenseInFeed />

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
            <RelatedGuideProducts
                collection="seed_products"
                categoryName={product.crop_name || "Seeds"}
                currentSlug={slug}
                targetCrops={product.crop_name ? [product.crop_name] : []}
            />
        </GuideDetailLayout>
    )
}
