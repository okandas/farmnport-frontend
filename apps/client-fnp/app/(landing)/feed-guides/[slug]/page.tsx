import type { Metadata } from "next"
import { BaseURL } from "@/lib/schemas"
import { guardTestItem } from "@/lib/guardTestItem"
import { ProductNotFound } from "@/components/shared/ProductNotFound"
import { GuideDetailLayout } from "@/components/shared/GuideDetailLayout"
import { RelatedGuideProducts } from "@/components/sections/related-guide-products"
import { AdSenseInFeed } from "@/components/ads/AdSenseInFeed"
import { capitalizeFirstLetter } from "@/lib/utilities"
import { WantToBuyCTA } from "@/components/shared/WantToBuyCTA"
import { FeedBreadcrumb } from "./FeedBreadcrumb"

interface FeedDetailPageProps {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: FeedDetailPageProps): Promise<Metadata> {
    const { slug } = await params
    let product: any = null
    try {
        const res = await fetch(`${BaseURL}/feed/${slug}`, { cache: "no-store" })
        if (res.ok) product = await res.json()
    } catch {}

    if (!product) {
        return { title: 'Feed Guide | farmnport.com', robots: { index: false } }
    }

    const name = product.name || capitalizeFirstLetter(slug.replace(/-/g, ' '))
    const brand = product.brand?.name ? ` by ${product.brand.name}` : ''
    const animal = product.animal ? ` for ${product.animal}` : ''
    const description = `${name}${brand} — ${product.phase || 'livestock'} feed guide${animal}. View nutritional specs, feeding instructions, and mixing recommendations.`

    return {
        title: `${name} — Feed Guide Zimbabwe | farmnport.com`,
        description,
        keywords: `${name.toLowerCase()}, ${product.animal?.toLowerCase() || 'livestock'} feed zimbabwe, ${product.phase?.toLowerCase() || ''} feed, feed guide zimbabwe, ${slug}`.replace(/, ,/g, ','),
        alternates: { canonical: `/feed-guides/${slug}` },
        openGraph: {
            title: `${name} — Feed Guide Zimbabwe`,
            description,
            url: `https://farmnport.com/feed-guides/${slug}`,
            siteName: "farmnport",
            type: "website",
        },
    }
}

const fetchOptions: RequestInit = { cache: "no-store" }

async function getFeedProduct(slug: string) {
    try {
        const res = await fetch(`${BaseURL}/feed/${slug}`, fetchOptions)
        if (!res.ok) return null
        return await res.json()
    } catch {
        return null
    }
}

export default async function FeedDetailPage({ params }: FeedDetailPageProps) {
    const { slug } = await params
    const product = await getFeedProduct(slug)

    if (!product) {
        return <ProductNotFound title="Feed Guide Not Found" description="The feed guide you're looking for doesn't exist or may have been removed." primary={{ href: "/feed-guides", label: "Browse Feed Guides" }} secondary={{ href: "/buy-feeds", label: "Buy Feeds" }} />
    }

    await guardTestItem(!!product.is_test)

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'
    const url = `${baseUrl}/feed-guides/${slug}`
    const imageUrl = product.images?.[0]?.img?.src || `${baseUrl}/default-feed.png`

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
            { "@type": "ListItem", "position": 2, "name": "Feed Guides", "item": "https://farmnport.com/feed-guides" },
            { "@type": "ListItem", "position": 3, "name": product.name, "item": url },
        ],
    }

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description || `${product.name} - ${product.animal} ${product.phase} feed in ${product.form} form`,
        "image": imageUrl,
        "category": product.feed_category?.name || "Livestock Feed",
        "url": url,
        "brand": product.brand?.name ? { "@type": "Brand", "name": product.brand.name } : undefined,
        "additionalProperty": [
            ...(product.animal ? [{ "@type": "PropertyValue", "name": "Animal", "value": product.animal }] : []),
            ...(product.phase ? [{ "@type": "PropertyValue", "name": "Phase", "value": product.phase }] : []),
            ...(product.form ? [{ "@type": "PropertyValue", "name": "Form", "value": product.form }] : []),
        ],
    }

    return (
        <GuideDetailLayout
            product={product}
            breadcrumbs={[
                { label: "Feed Guides", href: "/feed-guides" },
                { label: product.name, href: url },
            ]}
            categoryBadge={product.feed_category ? { label: product.feed_category.name } : undefined}
            buyHref={`/buy-feeds/${slug}`}
            interestHref={`/interest/feed/${slug}`}
            safetyText="Always follow the manufacturer's feeding guidelines and recommended dosage rates. Consult a veterinarian or animal nutritionist for advice specific to your livestock. Store feed products in a cool, dry place away from direct sunlight."
            structuredData={structuredData}
            breadcrumbJsonLd={breadcrumbJsonLd}
            safetyWarnings={product.safety_warnings}
            afterContent={
                <RelatedGuideProducts
                    collection="feed_products"
                    categoryName={product.feed_category?.name || "Animal Feed"}
                    currentSlug={slug}
                    targetAnimals={product.animal ? [product.animal] : []}
                />
            }
            customBreadcrumb={
                <div className="border-b">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                        <FeedBreadcrumb productName={product.name} />
                    </div>
                </div>
            }
        >
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
                {product.animal && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10 dark:bg-amber-950/30 dark:text-amber-400">
                        {product.animal}
                    </span>
                )}
                {product.phase && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/10 dark:bg-blue-950/30 dark:text-blue-400">
                        {product.phase}
                    </span>
                )}
                {product.form && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/10 dark:bg-green-950/30 dark:text-green-400">
                        {product.form}
                    </span>
                )}
                {product.sub_type && (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-600/10 dark:bg-violet-950/30 dark:text-violet-400">
                        {product.sub_type}
                    </span>
                )}
            </div>

            {/* Description */}
            {product.description && (
                <div>
                    <h2 className="text-lg font-semibold mb-3 text-foreground">Overview</h2>
                    <p className="text-muted-foreground leading-relaxed text-sm">{product.description}</p>
                </div>
            )}

            {/* Want to Buy CTA */}
            <WantToBuyCTA
                available_for_sale={product.available_for_sale}
                name={product.name}
                brand={product.brand?.name}
                href={`/buy-feeds/${slug}`}
                interestHref={`/interest/feed/${slug}`}
            />

            {/* Breed Recommendations */}
            {product.breed_recommendations && (
                <div>
                    <h2 className="text-lg font-semibold mb-2 text-foreground">Breed Recommendations</h2>
                    <p className="text-muted-foreground text-sm whitespace-pre-line">{product.breed_recommendations}</p>
                </div>
            )}

            {/* Feeding Instructions */}
            {product.feeding_instructions && product.feeding_instructions.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold mb-3 text-foreground">Feeding Instructions</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-2 pr-4 font-medium text-foreground">Period</th>
                                    <th className="text-left py-2 pr-4 font-medium text-foreground">Amount</th>
                                    <th className="text-left py-2 font-medium text-foreground">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {product.feeding_instructions.map((row: any, idx: number) => (
                                    <tr key={idx} className="border-b border-border/50">
                                        <td className="py-2 pr-4 text-muted-foreground">{row.period}</td>
                                        <td className="py-2 pr-4 text-muted-foreground">{row.amount}</td>
                                        <td className="py-2 text-muted-foreground">{row.notes}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Management Tips */}
            {product.management_tips && (
                <div>
                    <h2 className="text-lg font-semibold mb-2 text-foreground">Management Tips</h2>
                    <p className="text-muted-foreground text-sm whitespace-pre-line">{product.management_tips}</p>
                </div>
            )}

            {/* Active Ingredients */}
            {product.active_ingredients && product.active_ingredients.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold mb-3 text-foreground">Active Ingredients</h2>
                    <div className="space-y-2">
                        {product.active_ingredients.map((ai: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-950/30 rounded-lg border border-purple-100 dark:border-purple-900">
                                <span className="font-medium capitalize text-sm text-foreground">{ai.name}</span>
                                {ai.concentration && (
                                    <span className="font-bold text-purple-600 dark:text-purple-400">{ai.concentration}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <AdSenseInFeed />

            {/* Nutritional Specifications */}
            {product.nutritional_specs && product.nutritional_specs.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold mb-3 text-foreground">Nutritional Specifications</h2>
                    <div className="rounded-lg border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/50">
                                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Nutrient</th>
                                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Qualifier</th>
                                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Value</th>
                                    <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Unit</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {product.nutritional_specs.map((spec: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-2.5 font-medium text-foreground capitalize">{spec.name}</td>
                                        <td className="px-4 py-2.5 text-muted-foreground capitalize">{spec.qualifier || "-"}</td>
                                        <td className="px-4 py-2.5 text-right font-semibold text-foreground">{spec.value}</td>
                                        <td className="px-4 py-2.5 text-right text-muted-foreground">{spec.unit}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Mixing Recommendations */}
            {product.mixing_recommendations && product.mixing_recommendations.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold mb-3 text-foreground">Mixing Recommendations</h2>
                    <div className="space-y-4">
                        {product.mixing_recommendations.map((mix: any, idx: number) => (
                            <div key={idx} className="rounded-lg border p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-medium text-foreground">{mix.name || `Formulation ${idx + 1}`}</h3>
                                    {mix.resulting_protein && (
                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                            {mix.resulting_protein} Protein
                                        </span>
                                    )}
                                </div>
                                {mix.batch_size && (
                                    <p className="text-xs text-muted-foreground mb-3">Batch size: {mix.batch_size}</p>
                                )}
                                {mix.ingredients && mix.ingredients.length > 0 && (
                                    <div className="rounded-md border overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-muted/50">
                                                    <th className="text-left px-3 py-2 font-medium text-muted-foreground text-xs">Ingredient</th>
                                                    <th className="text-right px-3 py-2 font-medium text-muted-foreground text-xs">Quantity</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {mix.ingredients.map((ing: any, ingIdx: number) => (
                                                    <tr key={ingIdx}>
                                                        <td className="px-3 py-2 text-foreground">{ing.name}</td>
                                                        <td className="px-3 py-2 text-right text-muted-foreground">{ing.quantity} {ing.unit}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                {mix.notes && (
                                    <p className="mt-3 text-xs text-muted-foreground italic">{mix.notes}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Adaptation Schedule */}
            {product.adaptation_schedule && product.adaptation_schedule.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold mb-3 text-foreground">Adaptation Schedule</h2>
                    <div className="rounded-lg border overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-muted/50">
                                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Day</th>
                                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Amount</th>
                                    <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {product.adaptation_schedule.map((step: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-2.5 font-medium text-foreground">{step.day}</td>
                                        <td className="px-4 py-2.5 text-foreground">{step.amount}</td>
                                        <td className="px-4 py-2.5 text-muted-foreground">{step.notes || "-"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </GuideDetailLayout>
    )
}
