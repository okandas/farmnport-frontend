import { queryPlantNutritionProduct } from "@/lib/query"
import { Leaf } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BuyProductDetail } from "@/components/shop/BuyProductDetail"

interface BuyPlantNutritionProductPageProps {
    params: Promise<{ slug: string }>
}

export default async function BuyPlantNutritionProductPage({ params }: BuyPlantNutritionProductPageProps) {
    const { slug } = await params
    const response = await queryPlantNutritionProduct(slug)
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
    const salePrice = product.show_price && product.sale_price > 0 ? product.sale_price / 100 : null
    const wasPrice = product.was_price > product.sale_price ? product.was_price / 100 : null
    const categorySlug = product.plant_nutrition_category?.slug || 'all'

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": product.images?.[0]?.img?.src || `${baseUrl}/default-product.png`,
        "description": product.plant_nutrition_category?.name
            ? `${product.name} - ${product.plant_nutrition_category.name} for healthy crop nutrition`
            : `Professional plant nutrition product: ${product.name}`,
        "sku": product.id || slug,
        "category": product.plant_nutrition_category?.name || "Plant Nutrition",
        "brand": { "@type": "Brand", "name": product.brand?.name || "farmnport" },
        "offers": {
            "@type": "Offer",
            "url": `${baseUrl}/buy-plant-nutrition/${slug}`,
            "priceCurrency": "USD",
            "price": salePrice ? salePrice.toFixed(2) : "0.00",
            "availability": product.available_for_sale ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": { "@type": "Organization", "name": "farmnport" }
        }
    }

    const tabsContent = (
        <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">Overview</TabsTrigger>
                <TabsTrigger value="active-ingredients" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">Active Ingredients</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
                <p className="text-muted-foreground">
                    {product.plant_nutrition_category?.name
                        ? <>This is a <span className="font-medium capitalize">{product.plant_nutrition_category.name}</span> product designed for healthy crop nutrition and yield improvement.</>
                        : `${product.name} is a professional plant nutrition product.`}
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
                productType="plant_nutrition"
                images={product.images}
                fallbackIcon={<Leaf className="w-24 h-24 text-muted-foreground/30" />}
                brand={product.brand}
                brandHref={`/buy-plant-nutrition?brand=${product.brand?.id}`}
                categoryName={product.plant_nutrition_category?.name}
                salePrice={salePrice}
                wasPrice={wasPrice}
                availableForSale={product.available_for_sale}
                breadcrumb={{ href: "/buy-plant-nutrition", label: "Shop" }}
                guideHref={`/plant-nutrition-guides/${categorySlug}/${product.slug}`}
                loginRedirect={`/buy-plant-nutrition/${slug}`}
                tabsContent={tabsContent}
            />
        </>
    )
}
