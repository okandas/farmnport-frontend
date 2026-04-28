import { queryPlantNutritionProduct } from "@/lib/query"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Leaf, Beaker, Truck, Shield, RotateCcw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { AddToCartButton } from "@/components/cart/AddToCartButton"

interface BuyPlantNutritionProductPageProps {
    params: Promise<{ slug: string }>
}

export default async function BuyPlantNutritionProductPage({ params }: BuyPlantNutritionProductPageProps) {
    const { slug } = await params

    const response = await queryPlantNutritionProduct(slug)
    const product = response?.data

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'

    const structuredData = product ? {
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

    const categorySlug = product.plant_nutrition_category?.slug || 'all'

    return (
        <div className="min-h-screen bg-background">
            {structuredData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
            )}

            {/* Breadcrumb */}
            <div className="border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/buy-plant-nutrition" className="hover:text-foreground">Shop</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground capitalize">{product.name}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left Column - Images */}
                    <div className="space-y-4">
                        <div className="relative aspect-square bg-white rounded-lg border overflow-hidden">
                            {product.images && product.images[0] && product.images[0].img?.src ? (
                                <Image
                                    src={product.images[0].img.src}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 450px"
                                    className="object-contain p-4"
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Leaf className="w-24 h-24 text-muted-foreground/30" />
                                </div>
                            )}
                        </div>

                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {product.images.map((img: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="relative aspect-square bg-white rounded border hover:border-primary"
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
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column - Product Info */}
                    <div className="space-y-6">
                        {product.brand && (
                            <div>
                                <Link
                                    href={`/buy-plant-nutrition?brand=${product.brand.id}`}
                                    className="text-sm text-primary hover:underline uppercase tracking-wide font-medium"
                                >
                                    {product.brand.name}
                                </Link>
                            </div>
                        )}

                        <h1 className="text-3xl font-bold capitalize leading-tight">
                            {product.name}
                        </h1>

                        {product.plant_nutrition_category && (
                            <Badge variant="secondary" className="capitalize">
                                {product.plant_nutrition_category.name}
                            </Badge>
                        )}

                        <div className="h-px bg-border w-full" />

                        {/* Price Section */}
                        {product.show_price && product.sale_price > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-bold text-primary">${(product.sale_price / 100).toFixed(2)}</span>
                                    {product.was_price > product.sale_price && (
                                        <>
                                            <span className="text-lg text-muted-foreground line-through">${(product.was_price / 100).toFixed(2)}</span>
                                            <Badge variant="destructive">{Math.round((1 - product.sale_price / product.was_price) * 100)}% OFF</Badge>
                                        </>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">Incl. Tax</p>
                            </div>
                        )}

                        {/* Stock Status */}
                        <div className="flex items-center gap-2">
                            {product.available_for_sale ? (
                                <>
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    <span className="text-sm font-medium text-green-700 dark:text-green-400">In Stock</span>
                                </>
                            ) : (
                                <>
                                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                    <span className="text-sm font-medium text-red-700 dark:text-red-400">Out of Stock</span>
                                </>
                            )}
                        </div>

                        {/* Add to Cart */}
                        <AddToCartButton
                            productId={product.id}
                            productType="plant_nutrition"
                            productName={product.name}
                            productSlug={product.slug}
                            imageSrc={product.images?.[0]?.img?.src}
                            unitPrice={product.show_price && product.sale_price > 0 ? product.sale_price / 100 : null}
                            available={product.available_for_sale}
                            loginRedirect={`/buy-plant-nutrition/${slug}`}
                        />

                        {/* Delivery & Returns Info */}
                        <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                            <div className="flex items-start gap-3">
                                <Truck className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <div className="font-medium text-sm">Free Delivery</div>
                                    <div className="text-xs text-muted-foreground">On orders over $50</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <div className="font-medium text-sm">Quality Guaranteed</div>
                                    <div className="text-xs text-muted-foreground">Authentic products only</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <RotateCcw className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                    <div className="font-medium text-sm">7-Day Returns</div>
                                    <div className="text-xs text-muted-foreground">Unopened products</div>
                                </div>
                            </div>
                        </div>

                        {/* View Guide Link */}
                        <Link
                            href={`/plant-nutrition-guides/${categorySlug}/${product.slug}`}
                            className="text-sm text-primary hover:underline inline-flex items-center gap-2"
                        >
                            View Application Guide & Dosage Information
                            <span>→</span>
                        </Link>
                    </div>
                </div>

                {/* Product Details Tabs */}
                <div className="mt-12">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                            <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                                Overview
                            </TabsTrigger>
                            <TabsTrigger value="active-ingredients" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                                Active Ingredients
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-6">
                            <div className="prose prose-sm max-w-none">
                                <p className="text-muted-foreground">
                                    {product.plant_nutrition_category?.name && (
                                        <>This is a <span className="font-medium capitalize">{product.plant_nutrition_category.name}</span> product designed for healthy crop nutrition and yield improvement.</>
                                    )}
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="active-ingredients" className="mt-6">
                            {product.active_ingredients && product.active_ingredients.length > 0 ? (
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
                </div>
            </div>
        </div>
    )
}
