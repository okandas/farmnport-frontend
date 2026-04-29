import { queryAnimalHealthProduct } from "@/lib/query"
import Link from "next/link"
import { Beaker } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BuyProductInteractive } from "@/components/shop/BuyProductInteractive"

interface BuyAnimalHealthProductPageProps {
    params: Promise<{ slug: string }>
}

export default async function BuyAnimalHealthProductPage({ params }: BuyAnimalHealthProductPageProps) {
    const { slug } = await params

    const response = await queryAnimalHealthProduct(slug)
    const product = response?.data

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'

    const structuredData = product ? {
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
        }
    } : null

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

    const categorySlug = product.animal_health_category?.slug || "all"
    const tabs = ["overview", "active-ingredients", ...(product.targets?.length > 0 ? ["targets"] : [])]

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
                    {product.animal_health_category?.name
                        ? <>This is a <span className="font-medium capitalize">{product.animal_health_category.name}</span> product designed for effective animal health management.</>
                        : `${product.name} is a professional animal health product.`}
                </p>
            </TabsContent>
            <TabsContent value="active-ingredients" className="mt-4">
                {product.active_ingredients?.length > 0 ? (
                    <div className="divide-y">
                        {product.active_ingredients.map((ai: any, idx: number) => (
                            <div key={idx} className="flex justify-between py-2 text-sm">
                                <span className="capitalize">{ai.name}</span>
                                <span className="font-semibold">{ai.dosage_value} {ai.dosage_unit}</span>
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
                                <span>
                                    <span className="font-medium">{target.name}</span>
                                    {target.scientific_name && (
                                        <span className="text-xs text-muted-foreground italic ml-1">({target.scientific_name})</span>
                                    )}
                                </span>
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
                        <Link href="/" className="hover:text-foreground">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/buy-animal-health" className="hover:text-foreground">Shop</Link>
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
                    productType="animal_health"
                    categoryName={product.animal_health_category?.name}
                    brandHref={product.brand ? `/buy-animal-health?brand=${product.brand.id}` : undefined}
                    shopHref="/buy-animal-health"
                    guideHref={`/animal-health-guides/${categorySlug}/${slug}`}
                    loginRedirect={`/buy-animal-health/${slug}`}
                    fallbackIcon={<Beaker className="w-28 h-28 text-muted-foreground/20" />}
                    tabsContent={tabsContent}
                />
            </div>
        </div>
    )
}
