import { querySeedProduct, listBookingEvents } from "@/lib/query"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BuyProductInteractive } from "@/components/shop/BuyProductInteractive"

interface Props {
    params: Promise<{ slug: string }>
}

export default async function BuySeedProductPage({ params }: Props) {
    const { slug } = await params
    const [response, bookingRes] = await Promise.all([
        querySeedProduct(slug),
        listBookingEvents({ status: "open" }),
    ])
    const product = response?.data
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'

    const openEvent = (bookingRes?.data?.events ?? []).find(
        (e: any) => e.product_id && product?.id && e.product_id === product.id
    )

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

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.images?.[0]?.img?.src || `${baseUrl}/default-product.png`,
        "description": product.description || `${product.name}${product.variety ? ` — ${product.variety}` : ""}`,
        "sku": product.id || slug,
        "brand": { "@type": "Brand", "name": product.brand?.name || "farmnport" },
        "offers": {
            "@type": "Offer",
            "url": `${baseUrl}/buy-seed-products/${slug}`,
            "priceCurrency": "USD",
            "price": product.show_price && product.sale_price > 0 ? (product.sale_price / 100).toFixed(2) : "0.00",
            "availability": product.available_for_sale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": { "@type": "Organization", "name": "farmnport" }
        }
    }

    const hasPlantingGuide = product.planting_guide?.length > 0
    const tabs = [
        "overview",
        ...(hasPlantingGuide ? ["planting guide"] : []),
        ...(product.precautions?.length > 0 ? ["precautions"] : []),
    ]

    const tabsContent = (
        <Tabs defaultValue="overview">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-1">
                {tabs.map((tab) => (
                    <TabsTrigger key={tab} value={tab} className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-sm px-3 pb-2 capitalize">
                        {tab}
                    </TabsTrigger>
                ))}
            </TabsList>

            <TabsContent value="overview" className="mt-4 space-y-4 text-sm text-muted-foreground">
                {product.description && <p className="leading-relaxed">{product.description}</p>}
                <div className="grid grid-cols-2 gap-4">
                    {product.planting_season && (
                        <div>
                            <p className="font-medium text-foreground mb-0.5">Planting Season</p>
                            <p>{product.planting_season}</p>
                        </div>
                    )}
                    {product.days_to_maturity && (
                        <div>
                            <p className="font-medium text-foreground mb-0.5">Days to Maturity</p>
                            <p>{product.days_to_maturity}</p>
                        </div>
                    )}
                    {product.yield_potential && (
                        <div>
                            <p className="font-medium text-foreground mb-0.5">Yield Potential</p>
                            <p>{product.yield_potential}</p>
                        </div>
                    )}
                    {product.seed_treatment && (
                        <div>
                            <p className="font-medium text-foreground mb-0.5">Seed Treatment</p>
                            <p>{product.seed_treatment}</p>
                        </div>
                    )}
                </div>
                {product.soil_requirements && (
                    <div>
                        <p className="font-medium text-foreground mb-1">Soil Requirements</p>
                        <p className="leading-relaxed">{product.soil_requirements}</p>
                    </div>
                )}
                {product.management_tips && (
                    <div>
                        <p className="font-medium text-foreground mb-1">Management Tips</p>
                        <p className="leading-relaxed">{product.management_tips}</p>
                    </div>
                )}
                {!product.description && !product.planting_season && <p>Information coming soon.</p>}
            </TabsContent>

            {hasPlantingGuide && (
                <TabsContent value="planting guide" className="mt-4">
                    <ol className="space-y-3">
                        {product.planting_guide.map((step: any, i: number) => (
                            <li key={i} className="flex gap-3 text-sm">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">{i + 1}</span>
                                <div>
                                    <p className="font-medium text-foreground">{step.step}</p>
                                    {step.notes && <p className="text-muted-foreground mt-0.5">{step.notes}</p>}
                                </div>
                            </li>
                        ))}
                    </ol>
                </TabsContent>
            )}

            {product.precautions?.length > 0 && (
                <TabsContent value="precautions" className="mt-4">
                    <ul className="space-y-1.5">
                        {product.precautions.map((p: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 flex-shrink-0 mt-1.5" />
                                <span>{p}</span>
                            </li>
                        ))}
                    </ul>
                </TabsContent>
            )}
        </Tabs>
    )

    return (
        <div className="min-h-screen bg-background">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <div className="border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/buy" className="hover:text-foreground">Shop</Link>
                        <span className="mx-2">/</span>
                        <Link href="/buy-seed-products" className="hover:text-foreground">Buy Seed Products</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground capitalize">{product.name}</span>
                    </nav>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <BuyProductInteractive
                    product={product}
                    slug={slug}
                    baseUrl={baseUrl}
                    productType="seed_product"
                    categoryName={[product.variety, product.type?.replace("_", " ")].filter(Boolean).join(" · ")}
                    brandHref={product.brand ? `/buy-seed-products?brand=${product.brand.id}` : undefined}
                    shopHref="/buy-seed-products"
                    guideHref={`/seed-guides/${slug}`}
                    guideLabel="View Seed Guide & Growing Information →"
                    loginRedirect={`/buy-seed-products/${slug}`}
                    tabsContent={tabsContent}
                    ctaSlot={
                        (!product.available_for_sale || product.stock_level === 0) && openEvent ? (
                            <Link
                                href={`/bookings/${openEvent.slug}`}
                                className="mt-3 flex w-full items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl hover:bg-primary/90 transition-colors text-sm"
                            >
                                Pre-order Now
                            </Link>
                        ) : undefined
                    }
                />
            </div>
        </div>
    )
}
