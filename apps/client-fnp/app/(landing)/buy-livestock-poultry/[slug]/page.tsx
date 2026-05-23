import type { Metadata } from 'next'
import { queryLivestockPoultryProduct } from "@/lib/query"
import { formatProductName } from "@/lib/utilities"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BuyProductInteractive } from "@/components/shop/BuyProductInteractive"

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const response = await queryLivestockPoultryProduct(slug).catch(() => null)
    const product = response?.data
    if (!product) return { title: 'Livestock & Poultry | farmnport.com' }
    const name = formatProductName(product.name)
    const brand = product.brand?.name ? ` ${formatProductName(product.brand.name)}` : ''
    const category = [product.species, product.type].filter(Boolean).join(' ') || 'Livestock & Poultry'
    return {
        title: `${name}${brand} – Buy ${category} Zimbabwe | farmnport.com`,
        description: product.description || `Buy ${name}${brand}. ${category} for Zimbabwe farmers. View pricing and order online at farmnport.com.`,
        alternates: { canonical: `/buy-livestock-poultry/${slug}` },
        openGraph: {
            title: `${name}${brand} – ${category} | farmnport.com`,
            description: product.description || `Buy ${name}${brand} online. ${category} available in Zimbabwe.`,
            siteName: 'farmnport',
            type: 'website',
        },
    }
}

export default async function BuyLivestockPoultryProductPage({ params }: Props) {
    const { slug } = await params
    const response = await queryLivestockPoultryProduct(slug)
    const product = response?.data
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'

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
        "description": product.description || `${product.name} — ${product.species || ""} ${product.type || ""}`.trim(),
        "sku": product.id || slug,
        "brand": { "@type": "Brand", "name": product.brand?.name || "farmnport" },
        "offers": {
            "@type": "Offer",
            "url": `${baseUrl}/buy-livestock-poultry/${slug}`,
            "priceCurrency": "USD",
            "price": product.show_price && product.sale_price > 0 ? (product.sale_price / 100).toFixed(2) : "0.00",
            "availability": product.available_for_sale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": { "@type": "Organization", "name": "farmnport" }
        }
    }

    const hasFeedingStages = product.feeding_stages?.length > 0
    const hasVaccinations = product.vaccination_schedule?.length > 0
    const tabs = [
        "overview",
        ...(hasFeedingStages ? ["feeding"] : []),
        ...(hasVaccinations ? ["vaccination"] : []),
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
                {product.product_overview && <p className="leading-relaxed">{product.product_overview}</p>}
                {product.performance_metrics && (
                    <div>
                        <p className="font-medium text-foreground mb-1">Performance</p>
                        <p className="leading-relaxed">{product.performance_metrics}</p>
                    </div>
                )}
                {product.housing_requirements && (
                    <div>
                        <p className="font-medium text-foreground mb-1">Housing Requirements</p>
                        <p className="leading-relaxed">{product.housing_requirements}</p>
                    </div>
                )}
                {product.management_tips && (
                    <div>
                        <p className="font-medium text-foreground mb-1">Management Tips</p>
                        <p className="leading-relaxed">{product.management_tips}</p>
                    </div>
                )}
                {!product.description && !product.product_overview && <p>Information coming soon.</p>}
            </TabsContent>

            {hasFeedingStages && (
                <TabsContent value="feeding" className="mt-4">
                    <div className="divide-y text-sm">
                        <div className="grid grid-cols-4 gap-2 pb-2 font-medium text-foreground">
                            <span>Stage</span><span>Feed</span><span>Amount</span><span>Notes</span>
                        </div>
                        {product.feeding_stages.map((s: any, i: number) => (
                            <div key={i} className="py-2 grid grid-cols-4 gap-2 text-muted-foreground">
                                <span>{s.stage}</span><span>{s.feed}</span><span>{s.amount}</span><span>{s.notes}</span>
                            </div>
                        ))}
                    </div>
                </TabsContent>
            )}

            {hasVaccinations && (
                <TabsContent value="vaccination" className="mt-4">
                    <div className="divide-y text-sm">
                        <div className="grid grid-cols-4 gap-2 pb-2 font-medium text-foreground">
                            <span>Age</span><span>Vaccine</span><span>Route</span><span>Notes</span>
                        </div>
                        {product.vaccination_schedule.map((v: any, i: number) => (
                            <div key={i} className="py-2 grid grid-cols-4 gap-2 text-muted-foreground">
                                <span>{v.age}</span><span>{v.vaccine}</span><span className="capitalize">{v.route}</span><span>{v.notes}</span>
                            </div>
                        ))}
                    </div>
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
                        <Link href="/buy-livestock-poultry" className="hover:text-foreground">Buy Livestock & Poultry</Link>
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
                    productType="livestock_poultry"
                    categoryName={[product.species, product.type].filter(Boolean).join(" · ")}
                    brandHref={product.brand ? `/buy-livestock-poultry?brand=${product.brand.id}` : undefined}
                    shopHref="/buy-livestock-poultry"
                    loginRedirect={`/buy-livestock-poultry/${slug}`}
                    tabsContent={tabsContent}
                />
            </div>
        </div>
    )
}
