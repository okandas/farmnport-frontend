import { queryAgroChemical } from "@/lib/query"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Heart, Share2, Truck, Shield, RotateCcw, Bug, Beaker } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

interface BuyAgroChemicalPageProps {
    params: Promise<{
        slug: string
    }>
}

export default async function BuyAgroChemicalPage({ params }: BuyAgroChemicalPageProps) {
    const { slug } = await params

    const response = await queryAgroChemical(slug)

    const chemical = response?.data

    // Generate JSON-LD structured data for e-commerce
    const generateStructuredData = () => {
        if (!chemical) return null

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'
        const url = `${baseUrl}/buy-agrochemicals/${slug}`
        const imageUrl = chemical.images?.[0]?.img?.src || `${baseUrl}/default-chemical.png`

        const price = chemical.show_price && chemical.sale_price > 0 ? chemical.sale_price.toFixed(2) : '0.00'
        const availability = chemical.available_for_sale ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'

        return {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": chemical.name,
            "image": imageUrl,
            "description": chemical.agrochemical_category?.name
                ? `${chemical.name} - ${chemical.agrochemical_category.name} for effective pest and disease control`
                : `Professional agrochemical: ${chemical.name}`,
            "sku": chemical.id || slug,
            "category": chemical.agrochemical_category?.name || "Agrochemical",
            "brand": {
                "@type": "Brand",
                "name": chemical.brand?.name || "farmnport"
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

    if (!chemical) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
                    <p className="text-muted-foreground">The product you&apos;re looking for doesn&apos;t exist.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* JSON-LD Structured Data */}
            {structuredData && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
                />
            )}

            {/* Breadcrumb */}
            <div className="border-b bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/buy-agrochemicals" className="hover:text-foreground">Shop</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground capitalize">{chemical.name}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left Column - Images */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative aspect-square bg-white rounded-lg border overflow-hidden">
                            {chemical.images && chemical.images[0] && chemical.images[0].img?.src ? (
                                <Image
                                    src={chemical.images[0].img.src}
                                    alt={chemical.name}
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

                        {/* Thumbnail Gallery - if multiple images */}
                        {chemical.images && chemical.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {chemical.images.map((img: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="relative aspect-square bg-white rounded border hover:border-primary"
                                    >
                                        {img.img?.src && (
                                            <Image
                                                src={img.img.src}
                                                alt={`${chemical.name} ${idx + 1}`}
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
                        {/* Brand */}
                        {chemical.brand && (
                            <div>
                                <Link
                                    href={`/buy-agrochemicals?brand=${chemical.brand.id}`}
                                    className="text-sm text-primary hover:underline uppercase tracking-wide font-medium"
                                >
                                    {chemical.brand.name}
                                </Link>
                            </div>
                        )}

                        {/* Product Name */}
                        <h1 className="text-3xl font-bold capitalize leading-tight">
                            {chemical.name}
                        </h1>

                        {/* Category */}
                        {chemical.agrochemical_category && (
                            <Badge variant="secondary" className="capitalize">
                                {chemical.agrochemical_category.name}
                            </Badge>
                        )}

                        {/* Quick Stats */}
                        <div className="flex gap-6 py-4">
                            <div className="flex items-center gap-2">
                                <Bug className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <div className="text-sm font-medium">{chemical.targets?.length || 0}</div>
                                    <div className="text-xs text-muted-foreground">Targets</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Beaker className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <div className="text-sm font-medium">{chemical.active_ingredients?.length || 0}</div>
                                    <div className="text-xs text-muted-foreground">Active Ingredients</div>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-border w-full" />

                        {/* Price Section */}
                        {chemical.show_price && chemical.sale_price > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-baseline gap-3">
                                    <span className="text-4xl font-bold text-primary">${chemical.sale_price.toFixed(2)}</span>
                                    {chemical.was_price > chemical.sale_price && (
                                        <>
                                            <span className="text-lg text-muted-foreground line-through">${chemical.was_price.toFixed(2)}</span>
                                            <Badge variant="destructive">{Math.round((1 - chemical.sale_price / chemical.was_price) * 100)}% OFF</Badge>
                                        </>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground">Incl. Tax</p>
                            </div>
                        )}

                        {/* Stock Status */}
                        <div className="flex items-center gap-2">
                            {chemical.available_for_sale ? (
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
                        <div className="space-y-3">
                            <div className="flex gap-3">
                                <Link href="/waiting-list-shop" className="flex-1">
                                    <Button size="lg" className="w-full">
                                        <ShoppingCart className="w-5 h-5 mr-2" />
                                        Add to Cart
                                    </Button>
                                </Link>
                                <Button size="lg" variant="outline">
                                    <Heart className="w-5 h-5" />
                                </Button>
                                <Button size="lg" variant="outline">
                                    <Share2 className="w-5 h-5" />
                                </Button>
                            </div>
                            <Link href="/waiting-list-shop">
                                <Button size="lg" variant="secondary" className="w-full">
                                    Buy Now
                                </Button>
                            </Link>
                        </div>

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
                            href={`/agrochemical-guides/${chemical.slug}`}
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
                                    {chemical.agrochemical_category?.name && (
                                        <>This is a <span className="font-medium capitalize">{chemical.agrochemical_category.name}</span> designed for effective pest and disease control.</>
                                    )}
                                </p>
                                {/* Add more product details here */}
                            </div>
                        </TabsContent>

                        <TabsContent value="active-ingredients" className="mt-6">
                            {chemical.active_ingredients && chemical.active_ingredients.length > 0 ? (
                                <div className="space-y-4">
                                    {chemical.active_ingredients.map((ai: any, idx: number) => (
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
                            {chemical.targets && chemical.targets.length > 0 ? (
                                <div className="grid md:grid-cols-2 gap-4">
                                    {chemical.targets.map((target: any, idx: number) => (
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
