import { queryAnimalHealthProduct } from "@/lib/query"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Truck, Shield, RotateCcw, Bug, Beaker } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { AddToCartButton } from "@/components/cart/AddToCartButton"

interface BuyAnimalHealthProductPageProps {
    params: Promise<{
        slug: string
    }>
}

export default async function BuyAnimalHealthProductPage({ params }: BuyAnimalHealthProductPageProps) {
    const { slug } = await params

    const response = await queryAnimalHealthProduct(slug)

    const product = response?.data

    const generateStructuredData = () => {
        if (!product) return null

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'
        const url = `${baseUrl}/buy-animal-health/${slug}`
        const imageUrl = product.images?.[0]?.img?.src || `${baseUrl}/default-product.png`

        const price = product.show_price && product.sale_price > 0 ? product.sale_price.toFixed(2) : '0.00'
        const availability = product.available_for_sale ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'

        return {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "image": imageUrl,
            "description": product.animal_health_category?.name
                ? `${product.name} - ${product.animal_health_category.name} for effective animal health management`
                : `Professional animal health product: ${product.name}`,
            "sku": product.id || slug,
            "category": product.animal_health_category?.name || "Animal Health",
            "brand": {
                "@type": "Brand",
                "name": product.brand?.name || "farmnport"
            },
            "offers": {
                "@type": "Offer",
                "url": url,
                "priceCurrency": "USD",
                "price": price,
                "availability": availability,
                "seller": {
                    "@type": "Organization",
                    "name": "farmnport"
                }
            },
        }
    }

    const structuredData = generateStructuredData()

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

    const categorySlug = product.animal_health_category?.slug || 'all'

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
                        <Link href="/buy-animal-health" className="hover:text-foreground">Shop</Link>
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
                                    <Beaker className="w-24 h-24 text-muted-foreground/30" />
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
                                    href={`/buy-animal-health?brand=${product.brand.id}`}
                                    className="text-sm text-primary hover:underline uppercase tracking-wide font-medium"
                                >
                                    {product.brand.name}
                                </Link>
                            </div>
                        )}

                        <h1 className="text-3xl font-bold capitalize leading-tight">
                            {product.name}
                        </h1>

                        {product.animal_health_category && (
                            <Badge variant="secondary" className="capitalize">
                                {product.animal_health_category.name}
                            </Badge>
                        )}

                        {/* Quick Stats */}
                        <div className="flex gap-6 py-4">
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

                        <div className="h-px bg-border w-full" />

                        {/* Price Section */}
                        {product.show_price && product.sale_price > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-bold text-primary">${product.sale_price.toFixed(2)}</span>
                                    {product.was_price > product.sale_price && (
                                        <>
                                            <span className="text-lg text-muted-foreground line-through">${product.was_price.toFixed(2)}</span>
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

                        {/* Add to Cart Section */}
                        <AddToCartButton
                            productId={product.id}
                            productType="animal_health"
                            productName={product.name}
                            productSlug={product.slug}
                            imageSrc={product.images?.[0]?.img?.src}
                            unitPrice={product.show_price && product.sale_price > 0 ? product.sale_price / 100 : null}
                            available={product.available_for_sale}
                            loginRedirect={`/buy-animal-health/${slug}`}
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
                            href={`/animal-health-guides/${categorySlug}/${product.slug}`}
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
                            <TabsTrigger value="targets" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                                Targets
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-6">
                            <div className="prose prose-sm max-w-none">
                                <p className="text-muted-foreground">
                                    {product.animal_health_category?.name && (
                                        <>This is a <span className="font-medium capitalize">{product.animal_health_category.name}</span> product designed for effective animal health management.</>
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

                        <TabsContent value="targets" className="mt-6">
                            {product.targets && product.targets.length > 0 ? (
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
                </div>
            </div>
        </div>
    )
}
