import Image from "next/image"
import { Egg, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdSenseInFeed } from "@/components/ads/AdSenseInFeed"
import { BaseURL } from "@/lib/schemas"
import { BuyProductInteractive } from "@/components/shop/BuyProductInteractive"
import { BackToProgram } from "./BackToProgram"
import Link from "next/link"

interface BuyFeedPageProps {
    params: Promise<{ slug: string }>
}

const fetchOptions: RequestInit = process.env.NODE_ENV === "production"
    ? { next: { revalidate: 3600 } } as RequestInit
    : { cache: "no-store" }

async function getFeedProduct(slug: string) {
    try {
        const res = await fetch(`${BaseURL}/feed/${slug}`, fetchOptions)
        if (!res.ok) return null
        return await res.json()
    } catch {
        return null
    }
}

export default async function BuyFeedPage({ params }: BuyFeedPageProps) {
    const { slug } = await params
    const product = await getFeedProduct(slug)

    if (!product) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
                    <p className="text-muted-foreground">The product you&apos;re looking for doesn&apos;t exist.</p>
                </div>
            </div>
        )
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.images?.[0]?.img?.src || `${baseUrl}/default-feed.png`,
        "description": product.description || `${product.name} - ${product.animal} ${product.phase} feed in ${product.form} form`,
        "sku": product.id || slug,
        "category": product.feed_category?.name || "Livestock Feed",
        "brand": { "@type": "Brand", "name": product.brand?.name || "farmnport" },
        "offers": {
            "@type": "Offer",
            "url": `${baseUrl}/buy-feeds/${slug}`,
            "priceCurrency": "USD",
            "price": product.show_price && product.sale_price > 0 ? (product.sale_price / 100).toFixed(2) : "0.00",
            "availability": product.available_for_sale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": { "@type": "Organization", "name": "farmnport" }
        }
    }

    const tabsContent = (
        <>
            <Tabs defaultValue="overview">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-1 flex-wrap">
                    <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-sm px-3 pb-2">Overview</TabsTrigger>
                    <TabsTrigger value="active-ingredients" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-sm px-3 pb-2">Active Ingredients</TabsTrigger>
                    {product.targets?.length > 0 && (
                        <TabsTrigger value="targets" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-sm px-3 pb-2">Targets</TabsTrigger>
                    )}
                    {product.nutritional_specs?.length > 0 && (
                        <TabsTrigger value="nutritional-specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-sm px-3 pb-2">Nutritional Specs</TabsTrigger>
                    )}
                    {product.mixing_recommendations?.length > 0 && (
                        <TabsTrigger value="mixing" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-sm px-3 pb-2">Mixing</TabsTrigger>
                    )}
                    {product.adaptation_schedule?.length > 0 && (
                        <TabsTrigger value="adaptation" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-sm px-3 pb-2">Adaptation</TabsTrigger>
                    )}
                    {(product.front_label?.img?.src || product.back_label?.img?.src) && (
                        <TabsTrigger value="labels" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-sm px-3 pb-2">Labels</TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="overview" className="mt-4">
                    <div className="space-y-4">
                        {(product.animal || product.phase || product.form) && (
                            <div className="flex gap-3 flex-wrap">
                                {product.animal && <Badge variant="secondary">{product.animal}</Badge>}
                                {product.phase && <Badge variant="outline">{product.phase}</Badge>}
                                {product.form && <Badge variant="outline">{product.form}</Badge>}
                            </div>
                        )}
                        {product.description && <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>}
                        {product.package_size && (
                            <div>
                                <p className="text-sm font-semibold mb-1">Package Size</p>
                                <p className="text-sm text-muted-foreground">{product.package_size}</p>
                            </div>
                        )}
                        {product.feeding_instructions?.length > 0 && (
                            <div>
                                <p className="text-sm font-semibold mb-2">Feeding Instructions</p>
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
                                            {product.feeding_instructions.map((i: any, idx: number) => (
                                                <tr key={idx} className="border-b border-border/50">
                                                    <td className="py-2 pr-4 text-muted-foreground">{i.period}</td>
                                                    <td className="py-2 pr-4 text-muted-foreground">{i.amount}</td>
                                                    <td className="py-2 text-muted-foreground">{i.notes}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {product.management_tips && (
                            <div>
                                <p className="text-sm font-semibold mb-1">Management Tips</p>
                                <p className="text-sm text-muted-foreground whitespace-pre-line">{product.management_tips}</p>
                            </div>
                        )}
                        {product.breed_recommendations && (
                            <div>
                                <p className="text-sm font-semibold mb-1">Breed Recommendations</p>
                                <p className="text-sm text-muted-foreground whitespace-pre-line">{product.breed_recommendations}</p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="active-ingredients" className="mt-4">
                    {product.active_ingredients?.length > 0 ? (
                        <div className="divide-y">
                            {product.active_ingredients.map((ai: any, idx: number) => (
                                <div key={idx} className="flex justify-between py-2 text-sm">
                                    <span className="capitalize">{ai.name}</span>
                                    {ai.concentration && <span className="font-semibold">{ai.concentration}</span>}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground mt-4">No information available.</p>
                    )}
                </TabsContent>

                {product.targets?.length > 0 && (
                    <TabsContent value="targets" className="mt-4">
                        <ul className="space-y-1.5">
                            {product.targets.map((target: any, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-sm">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0 mt-1.5" />
                                    <span className="font-medium capitalize">{target.name}</span>
                                </li>
                            ))}
                        </ul>
                    </TabsContent>
                )}

                {product.nutritional_specs?.length > 0 && (
                    <TabsContent value="nutritional-specs" className="mt-4">
                        <div className="rounded-lg border overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/50">
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Nutrient</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Qualifier</th>
                                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">Value</th>
                                        <th className="text-right px-4 py-3 font-medium text-muted-foreground">Unit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {product.nutritional_specs.map((spec: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-medium text-foreground capitalize">{spec.name}</td>
                                            <td className="px-4 py-3 text-muted-foreground capitalize">{spec.qualifier || "-"}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-foreground">{spec.value}</td>
                                            <td className="px-4 py-3 text-right text-muted-foreground">{spec.unit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>
                )}

                {product.mixing_recommendations?.length > 0 && (
                    <TabsContent value="mixing" className="mt-4">
                        <div className="space-y-6">
                            {product.mixing_recommendations.map((mix: any, idx: number) => (
                                <div key={idx} className="rounded-lg border p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-foreground">{mix.name || `Formulation ${idx + 1}`}</h3>
                                        {mix.resulting_protein && <Badge variant="secondary">{mix.resulting_protein} Protein</Badge>}
                                    </div>
                                    {mix.batch_size && <p className="text-sm text-muted-foreground mb-4">Batch size: {mix.batch_size}</p>}
                                    {mix.ingredients?.length > 0 && (
                                        <div className="rounded-md border overflow-hidden">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-muted/50">
                                                        <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Ingredient</th>
                                                        <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Quantity</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y">
                                                    {mix.ingredients.map((ing: any, ingIdx: number) => (
                                                        <tr key={ingIdx}>
                                                            <td className="px-4 py-2.5 text-foreground">{ing.name}</td>
                                                            <td className="px-4 py-2.5 text-right text-muted-foreground">{ing.quantity} {ing.unit}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                    {mix.notes && <p className="mt-4 text-sm text-muted-foreground italic">{mix.notes}</p>}
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                )}

                {product.adaptation_schedule?.length > 0 && (
                    <TabsContent value="adaptation" className="mt-4">
                        <div className="rounded-lg border overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-muted/50">
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Day</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {product.adaptation_schedule.map((step: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-medium text-foreground">{step.day}</td>
                                            <td className="px-4 py-3 text-foreground">{step.amount}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{step.notes || "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </TabsContent>
                )}

                {(product.front_label?.img?.src || product.back_label?.img?.src) && (
                    <TabsContent value="labels" className="mt-4">
                        <div className="grid md:grid-cols-2 gap-6">
                            {product.front_label?.img?.src && (
                                <div className="space-y-3">
                                    <h3 className="font-semibold">Front Label</h3>
                                    <div className="relative aspect-[3/4] bg-white rounded-lg border overflow-hidden">
                                        <Image src={product.front_label.img.src} alt={`${product.name} - Front Label`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-4" />
                                    </div>
                                </div>
                            )}
                            {product.back_label?.img?.src && (
                                <div className="space-y-3">
                                    <h3 className="font-semibold">Back Label</h3>
                                    <div className="relative aspect-[3/4] bg-white rounded-lg border overflow-hidden">
                                        <Image src={product.back_label.img.src} alt={`${product.name} - Back Label`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-contain p-4" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                )}
            </Tabs>

            <div className="mt-8"><AdSenseInFeed /></div>

            {product.safety_warnings && (
                <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold mb-2 text-red-900 dark:text-red-100">Safety Warning</h3>
                            <p className="text-sm text-red-800 dark:text-red-200 whitespace-pre-line">{product.safety_warnings}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
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
        </>
    )

    return (
        <div className="min-h-screen bg-background">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <div className="border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/buy-feeds" className="hover:text-foreground">Feeds</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground capitalize">{product.name}</span>
                    </nav>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <BackToProgram />
                <BuyProductInteractive
                    product={product}
                    slug={slug}
                    baseUrl={baseUrl}
                    productType="feed"
                    categoryName={product.feed_category?.name}
                    brandHref={product.brand ? `/buy-feeds?brand=${product.brand.name}` : undefined}
                    shopHref="/buy-feeds"
                    guideHref={`/feeds/${slug}`}
                    guideLabel="View Feed Guide →"
                    loginRedirect={`/buy-feeds/${slug}`}
                    fallbackIcon={<Egg className="w-28 h-28 text-muted-foreground/20" />}
                    tabsContent={tabsContent}
                />
            </div>
        </div>
    )
}
