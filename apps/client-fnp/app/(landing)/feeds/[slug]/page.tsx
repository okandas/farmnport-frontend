import { notFound } from "next/navigation"
import Image from "next/image"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { AdSenseInFeed } from "@/components/ads/AdSenseInFeed"
import { capitalizeFirstLetter } from "@/lib/utilities"
import { BaseURL } from "@/lib/schemas"
import { BuyNowButton } from "./BuyNowButton"
import { FeedBreadcrumb } from "./FeedBreadcrumb"

interface FeedDetailPageProps {
    params: Promise<{ slug: string }>
}

const fetchOptions: RequestInit = process.env.NODE_ENV === "production"
    ? { next: { revalidate: 3600 } } as RequestInit
    : { cache: "no-store" }

async function getFeedProduct(slug: string) {
    try {
        const res = await fetch(`${BaseURL}/feed/${slug}`, fetchOptions)
        if (!res.ok) return null
        const json = await res.json()
        return json?.data || null
    } catch {
        return null
    }
}

export default async function FeedDetailPage({ params }: FeedDetailPageProps) {
    const { slug } = await params
    const product = await getFeedProduct(slug)

    if (!product) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4 pb-4">
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-semibold mb-2">Feed Product Not Found</h2>
                    <p className="text-muted-foreground mb-6">
                        We couldn&apos;t find the feed product you&apos;re looking for.
                    </p>
                    <Link
                        href="/feeds"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 transition-colors"
                    >
                        Browse All Feed Products
                    </Link>
                </div>
            </div>
        )
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'
    const url = `${baseUrl}/feeds/${slug}`
    const imageUrl = product.images?.[0]?.img?.src || `${baseUrl}/default-feed.png`

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description || `${product.name} - ${product.animal} ${product.phase} feed in ${product.form} form`,
        "image": imageUrl,
        "category": product.feed_category?.name || "Livestock Feed",
        "url": url,
        "brand": product.brand?.name ? {
            "@type": "Brand",
            "name": product.brand.name,
        } : undefined,
        "additionalProperty": [
            ...(product.animal ? [{ "@type": "PropertyValue", "name": "Animal", "value": product.animal }] : []),
            ...(product.phase ? [{ "@type": "PropertyValue", "name": "Phase", "value": product.phase }] : []),
            ...(product.form ? [{ "@type": "PropertyValue", "name": "Form", "value": product.form }] : []),
            ...(product.active_ingredients?.map((ai: any) => ({
                "@type": "PropertyValue",
                "name": "Active Ingredient",
                "value": ai.concentration ? `${ai.name} (${ai.concentration})` : ai.name,
            })) || []),
        ],
    }

    return (
        <div className="min-h-screen bg-background">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            {/* Breadcrumb */}
            <div className="border-b bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <FeedBreadcrumb productName={product.name} />
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
                                <div className="absolute inset-0 bg-white" />
                            )}
                        </div>

                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-3">
                                {product.images.slice(0, 4).map((img: any, idx: number) => (
                                    <button
                                        key={idx}
                                        className="relative aspect-square bg-white rounded-lg border hover:border-primary transition-colors"
                                    >
                                        {img.img?.src && (
                                            <Image
                                                src={img.img.src}
                                                alt={`${product.name} ${idx + 1}`}
                                                fill
                                                sizes="(max-width: 1024px) 25vw, 100px"
                                                className="object-contain p-2"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        <BuyNowButton slug={slug} />
                    </div>

                    {/* Right - Product Info */}
                    <div className="space-y-6">
                        <h1 className="text-3xl lg:text-4xl font-bold capitalize leading-tight">
                            {product.name}
                        </h1>

                        {/* Badges */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {product.feed_category && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                    {product.feed_category.name}
                                </span>
                            )}
                            {product.brand && (
                                <span className="text-sm text-muted-foreground">
                                    by {capitalizeFirstLetter(product.brand.name)}
                                </span>
                            )}
                        </div>

                        {product.available_for_sale && product.show_price && product.sale_price > 0 && (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground">Price:</span>
                                {product.was_price > 0 && product.was_price > product.sale_price && (
                                    <span className="text-lg text-muted-foreground line-through">${product.was_price.toFixed(2)}</span>
                                )}
                                <span className="text-2xl font-bold text-primary">${product.sale_price.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="h-px bg-border" />

                        {/* Animal / Phase / Form / Sub Type */}
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
                                <h2 className="text-lg font-semibold mb-3 text-foreground">Description</h2>
                                <p className="text-muted-foreground leading-relaxed text-sm">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Package Size */}
                        {product.package_size && (
                            <div>
                                <h2 className="text-lg font-semibold mb-3 text-foreground">Package Size</h2>
                                <p className="text-muted-foreground leading-relaxed text-sm">{product.package_size}</p>
                            </div>
                        )}

                        {/* Breed Recommendations */}
                        {product.breed_recommendations && (
                            <div>
                                <h2 className="text-lg font-semibold mb-3 text-foreground">Breed Recommendations</h2>
                                <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">{product.breed_recommendations}</p>
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
                                            {product.feeding_instructions.map((instruction: { period: string; amount: string; notes: string }, idx: number) => (
                                                <tr key={idx} className="border-b border-border/50">
                                                    <td className="py-2 pr-4 text-muted-foreground">{instruction.period}</td>
                                                    <td className="py-2 pr-4 text-muted-foreground">{instruction.amount}</td>
                                                    <td className="py-2 text-muted-foreground">{instruction.notes}</td>
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
                                <h2 className="text-lg font-semibold mb-3 text-foreground">Management Tips</h2>
                                <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">{product.management_tips}</p>
                            </div>
                        )}

                        {/* Active Ingredients - only show if product has them */}
                        {product.active_ingredients && product.active_ingredients.length > 0 && (
                            <div>
                                <h2 className="text-lg font-semibold mb-3 text-foreground">
                                    Active Ingredients
                                </h2>
                                <div className="space-y-2">
                                    {product.active_ingredients.map((ai: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-950/30 rounded-lg border border-purple-100 dark:border-purple-900 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                                            <div className="font-medium capitalize text-sm text-foreground">{ai.name}</div>
                                            {ai.concentration && (
                                                <div className="text-right">
                                                    <div className="font-bold text-purple-600 dark:text-purple-400">{ai.concentration}</div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <AdSenseInFeed />

                        {/* Targets */}
                        {product.targets && product.targets.length > 0 && (
                            <div className="rounded-xl border bg-card p-4">
                                <h2 className="text-sm font-semibold uppercase tracking-wide text-green-700 dark:text-green-400 mb-3">
                                    Targets
                                </h2>
                                <ul className="space-y-1.5">
                                    {product.targets.map((target: any, idx: number) => (
                                        <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                                            <span className="h-1.5 w-1.5 rounded-full bg-green-500 dark:bg-green-400 flex-shrink-0 mt-1.5" />
                                            <span className="capitalize">{target.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
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
                    </div>
                </div>

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

                {/* Product-Specific Safety Warnings */}
                {product.safety_warnings && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold mb-2 text-red-900 dark:text-red-100">Safety Warning</h3>
                                <p className="text-sm text-red-800 dark:text-red-200 whitespace-pre-line">
                                    {product.safety_warnings}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Safety / Disclaimer */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold mb-2 text-yellow-900 dark:text-yellow-100">Important Notice</h3>
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                Always follow the manufacturer&apos;s feeding guidelines and recommended dosage rates. Consult a veterinarian or animal nutritionist for advice specific to your livestock. Store feed products in a cool, dry place away from direct sunlight.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
