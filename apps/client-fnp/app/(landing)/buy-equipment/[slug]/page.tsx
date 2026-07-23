import type { Metadata } from 'next'
import { notFound } from "next/navigation"
import { serverFetch } from "@/lib/serverFetch"
import { buildBuyMetadata } from "@/lib/utilities"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BuyProductInteractive } from "@/components/shop/BuyProductInteractive"
import { guardTestItem } from "@/lib/guardTestItem"

interface BuyEquipmentProductPageProps {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BuyEquipmentProductPageProps): Promise<Metadata> {
    const { slug } = await params
    const product = await serverFetch(`/equipment/${slug}`).catch(() => null)
    if (!product) return { title: 'Farm Equipment | farmnport.com', robots: { index: false } }
    return buildBuyMetadata(product, product.equipment_category?.name || 'Farm Equipment', `/buy-equipment/${slug}`, 'farmers in Zimbabwe', product.images?.[0]?.img?.src)
}

export default async function BuyEquipmentProductPage({ params }: BuyEquipmentProductPageProps) {
    const { slug } = await params

    const product = await serverFetch(`/equipment/${slug}`).catch(() => null)
    if (!product) notFound()
    await guardTestItem(!!product.is_test)

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'

    const structuredData = product ? {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.images?.[0]?.img?.src || `${baseUrl}/default-product.png`,
        "description": product.equipment_category?.name
            ? `${product.name} - ${product.equipment_category.name} for farmers`
            : `Farm equipment: ${product.name}`,
        "sku": product.id || slug,
        "category": product.equipment_category?.name || "Farm Equipment",
        "brand": { "@type": "Brand", "name": product.brand?.name || "farmnport" },
        "offers": {
            "@type": "Offer",
            "url": `${baseUrl}/buy-equipment/${slug}`,
            "priceCurrency": "USD",
            "price": product.sale_price > 0 ? (product.sale_price / 100).toFixed(2) : "0.00",
            "availability": product.available_for_sale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": { "@type": "Organization", "name": "farmnport" }
        }
    } : null

    const categorySlug = product.equipment_category?.slug || "all"

    const tabs = [
        "overview",
        ...(product.specifications?.length > 0 ? ["specifications"] : []),
        ...(product.features?.length > 0 ? ["features"] : []),
    ]

    const tabsContent = (
        <Tabs defaultValue="overview">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-1">
                {tabs.map((tab) => (
                    <TabsTrigger key={tab} value={tab} className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-sm px-3 pb-2 capitalize">
                        {tab.replace("-", " ")}
                    </TabsTrigger>
                ))}
            </TabsList>
            <TabsContent value="overview" className="mt-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {product.description || (product.equipment_category?.name
                        ? <>This is a <span className="font-medium capitalize">{product.equipment_category.name}</span> product for farm use.</>
                        : `${product.name} is a farm equipment product.`)}
                </p>
            </TabsContent>
            {product.specifications?.length > 0 && (
                <TabsContent value="specifications" className="mt-4">
                    <dl className="space-y-2">
                        {product.specifications.map((spec: any, idx: number) => (
                            <div key={idx} className="flex justify-between gap-4 py-2 text-sm border-b last:border-0">
                                <dt className="text-muted-foreground">{spec.name}</dt>
                                <dd className="font-semibold">{spec.value}</dd>
                            </div>
                        ))}
                    </dl>
                </TabsContent>
            )}
            {product.features?.length > 0 && (
                <TabsContent value="features" className="mt-4">
                    <ul className="space-y-1.5">
                        {product.features.map((feature: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>
                </TabsContent>
            )}
        </Tabs>
    )

    return (
        <div className="min-h-screen bg-background">
            {structuredData && (
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            )}
            <div className="border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/buy" className="hover:text-foreground">Shop</Link>
                        <span className="mx-2">/</span>
                        <Link href="/buy-equipment" className="hover:text-foreground">Buy Equipment</Link>
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
                    productType="equipment"
                    categoryName={product.equipment_category?.name}
                    brandHref={product.brand ? `/buy-equipment?brand=${product.brand.id}` : undefined}
                    shopHref="/buy-equipment"
                    guideHref={`/equipment-guides/${categorySlug}/${slug}`}
                    loginRedirect={`/buy-equipment/${slug}`}
                    tabsContent={tabsContent}
                />
            </div>
        </div>
    )
}
