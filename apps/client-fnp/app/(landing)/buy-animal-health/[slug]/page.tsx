import { queryAnimalHealthProduct } from "@/lib/query"
import { Beaker, Bug } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BuyProductDetail } from "@/components/shop/BuyProductDetail"

interface BuyAnimalHealthProductPageProps {
    params: Promise<{ slug: string }>
}

export default async function BuyAnimalHealthProductPage({ params }: BuyAnimalHealthProductPageProps) {
    const { slug } = await params
    const response = await queryAnimalHealthProduct(slug)
    const product = response?.data

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
        "image": product.images?.[0]?.img?.src || `${baseUrl}/default-product.png`,
        "description": product.animal_health_category?.name
            ? `${product.name} - ${product.animal_health_category.name} for effective animal health management`
            : `Professional animal health product: ${product.name}`,
        "sku": product.id || slug,
        "category": product.animal_health_category?.name || "Animal Health",
        "brand": { "@type": "Brand", "name": product.brand?.name || "farmnport" },
        "offers": {
            "@type": "Offer",
            "url": `${baseUrl}/buy-animal-health/${slug}`,
            "priceCurrency": "USD",
            "price": product.show_price && product.sale_price > 0 ? (product.sale_price / 100).toFixed(2) : "0.00",
            "availability": product.available_for_sale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": { "@type": "Organization", "name": "farmnport" }
        },
    }

    const categorySlug = product.animal_health_category?.slug || 'all'
    const salePrice = product.show_price && product.sale_price > 0 ? product.sale_price / 100 : null
    const wasPrice = product.was_price > product.sale_price ? product.was_price / 100 : null

    const extraStats = (
        <div className="flex gap-6 py-2">
            <div className="flex items-center gap-2">
                <Bug className="w-5 h-5 text-muted-foreground" />
                <div>
                    <div className="text-sm font-medium">{product.targets?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Targets</div>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Beaker className="w-5 h-5 text-muted-foreground" />
                <div>
                    <div className="text-sm font-medium">{product.active_ingredients?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Active Ingredients</div>
                </div>
            </div>
        </div>
    )

    const tabsContent = (
        <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">Overview</TabsTrigger>
                <TabsTrigger value="active-ingredients" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">Active Ingredients</TabsTrigger>
                <TabsTrigger value="targets" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">Targets</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
                <p className="text-muted-foreground">
                    {product.animal_health_category?.name
                        ? <>This is a <span className="font-medium capitalize">{product.animal_health_category.name}</span> product designed for effective animal health management.</>
                        : `${product.name} is a professional animal health product.`}
                </p>
            </TabsContent>

            <TabsContent value="active-ingredients" className="mt-6">
                {product.active_ingredients?.length > 0 ? (
                    <div className="space-y-4">
                        {product.active_ingredients.map((ai: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                                <div>
                                    <div className="font-medium capitalize">{ai.name}</div>
                                    <div className="text-sm text-muted-foreground">Active Ingredient</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold">{ai.dosage_value} {ai.dosage_unit}</div>
                                    <div className="text-xs text-muted-foreground">Concentration</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">No active ingredient information available.</p>
                )}
            </TabsContent>

            <TabsContent value="targets" className="mt-6">
                {product.targets?.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                        {product.targets.map((target: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                                <Bug className="w-5 h-5 text-primary" />
                                <div>
                                    <div className="font-medium">{target.name}</div>
                                    {target.scientific_name && (
                                        <div className="text-xs text-muted-foreground italic">{target.scientific_name}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground">No target information available.</p>
                )}
            </TabsContent>
        </Tabs>
    )

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            <BuyProductDetail
                productId={product.id}
                productName={product.name}
                productSlug={product.slug}
                productType="animal_health"
                images={product.images}
                fallbackIcon={<Beaker className="w-24 h-24 text-muted-foreground/30" />}
                brand={product.brand}
                brandHref={`/buy-animal-health?brand=${product.brand?.id}`}
                categoryName={product.animal_health_category?.name}
                salePrice={salePrice}
                wasPrice={wasPrice}
                availableForSale={product.available_for_sale}
                breadcrumb={{ href: "/buy-animal-health", label: "Shop" }}
                guideHref={`/animal-health-guides/${categorySlug}/${product.slug}`}
                loginRedirect={`/buy-animal-health/${slug}`}
                extraStats={extraStats}
                tabsContent={tabsContent}
            />
        </>
    )
}
