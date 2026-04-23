import Image from "next/image"
import { Beaker, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { AdSenseInFeed } from "@/components/ads/AdSenseInFeed"
import { capitalizeFirstLetter } from "@/lib/utilities"
import { BaseURL } from "@/lib/schemas"
import { FertilizerApplicationRates } from "@/components/agrochemical/FertilizerApplicationRates"
import { ActiveIngredientsList } from "@/components/shared/ActiveIngredientUnitsKey"

interface GuidePageProps {
    params: Promise<{
        category: string
        slug: string
    }>
}

const fetchOptions: RequestInit = process.env.NODE_ENV === "production"
    ? { next: { revalidate: 3600 } } as RequestInit
    : { cache: "no-store" }

export default async function PlantNutritionGuidePage({ params }: GuidePageProps) {
    const { category, slug } = await params
    const res = await fetch(`${BaseURL}/plantnutrition/${slug}`, fetchOptions)
    const product = res.ok ? await res.json() : null

    if (!product) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4 pb-4">
                <div className="text-center max-w-md">
                    <div className="mb-6">
                        <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                            <Beaker className="w-10 h-10 text-muted-foreground" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-semibold mb-2">Guide Not Found</h2>
                    <p className="text-muted-foreground mb-6">
                        We couldn&apos;t find the plant nutrition guide you&apos;re looking for. It may have been removed or the link might be incorrect.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/plant-nutrition-guides">
                            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                                Browse All Guides
                            </button>
                        </Link>
                        <Link href="/plant-nutrition-guides">
                            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                                Go to Categories
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const categorySlug = product?.plant_nutrition_category?.slug || category

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'
    const url = `${baseUrl}/plant-nutrition-guides/${category}/${slug}`
    const imageUrl = product.images?.[0]?.img?.src || `${baseUrl}/default-chemical.png`

    const description = product.plant_nutrition_category?.name
        ? `${product.name} is a ${product.plant_nutrition_category.name}. View active ingredients and application rates.`
        : `Plant nutrition guide for ${product.name}. Complete information on active ingredients and application rates.`

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": description,
        "image": imageUrl,
        "category": product.plant_nutrition_category?.name || "Plant Nutrition",
        "url": url,
        "additionalProperty": product.active_ingredients?.map((ai: any) => ({
            "@type": "PropertyValue",
            "name": "Active Ingredient",
            "value": `${ai.name} (${ai.dosage_value} ${ai.dosage_unit})`
        })) || [],
        "brand": product.brand ? { "@type": "Brand", "name": product.brand.name } : undefined,
    }

    return (
        <div className="min-h-screen bg-background">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            {/* Breadcrumb */}
            <div className="border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/plant-nutrition-guides" className="hover:text-foreground">Guides</Link>
                        <span className="mx-2">/</span>
                        <Link href={`/plant-nutrition-guides/${categorySlug}`} className="hover:text-foreground capitalize">{product.plant_nutrition_category?.name || category}</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground capitalize">{product.name}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="grid lg:grid-cols-[450px,1fr] gap-12 mb-16">
                    {/* Left - Image + Precautions */}
                    <div className="space-y-4">
                        <div className="relative aspect-square bg-white rounded-xl border overflow-hidden shadow-sm">
                            {product.images && product.images[0] && product.images[0].img?.src ? (
                                <Image
                                    src={product.images[0].img.src}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 450px"
                                    className="object-contain p-8"
                                    priority
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Beaker className="w-24 h-24 text-muted-foreground/30" />
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        {product.images && product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-3">
                                {product.images.slice(0, 4).map((img: any, idx: number) => (
                                    <div key={idx} className="relative aspect-square bg-white rounded-lg border hover:border-primary transition-colors">
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

                        {/* Precautions */}
                        {product.precautions && product.precautions.length > 0 && (
                            <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/30 px-3 py-2">
                                <h2 className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-400 mb-1.5 flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    Precautions
                                </h2>
                                <ul className="space-y-0.5">
                                    {product.precautions.map((precaution: string, idx: number) => (
                                        <li key={idx} className="flex items-start gap-1.5 text-xs text-red-800 dark:text-red-300">
                                            <span className="h-1 w-1 rounded-full bg-red-500 dark:bg-red-400 flex-shrink-0 mt-1.5" />
                                            <span>{precaution}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Right - Product Info */}
                    <div className="space-y-6">
                        <h1 className="text-3xl lg:text-4xl font-bold capitalize leading-tight">
                            {product.name}
                        </h1>

                        {/* Category Badge */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {product.plant_nutrition_category && (
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                    {product.plant_nutrition_category.name}
                                </div>
                            )}
                        </div>

                        {/* Variants / Pack Sizes */}
                        {product.variants && product.variants.length > 0 && (
                            <div>
                                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Pack Sizes & Pricing</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {product.variants.map((variant: any, idx: number) => (
                                        <div key={idx} className="rounded-lg border bg-card p-3 flex flex-col gap-1">
                                            <span className="text-sm font-medium text-foreground">{variant.name}</span>
                                            {variant.sale_price > 0 && (
                                                <div className="flex items-baseline gap-1.5">
                                                    {variant.was_price > 0 && variant.was_price > variant.sale_price && (
                                                        <span className="text-xs text-muted-foreground line-through">${(variant.was_price / 100).toFixed(2)}</span>
                                                    )}
                                                    <span className="text-base font-bold text-primary">${(variant.sale_price / 100).toFixed(2)}</span>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {(!product.variants || product.variants.length === 0) && product.show_price && product.sale_price > 0 && (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground">Guide Price:</span>
                                {product.was_price > 0 && product.was_price > product.sale_price && (
                                    <span className="text-lg text-muted-foreground line-through">${(product.was_price / 100).toFixed(2)}</span>
                                )}
                                <span className="text-2xl font-bold text-primary">${(product.sale_price / 100).toFixed(2)}</span>
                            </div>
                        )}

                        <div className="h-px bg-border" />

                        {/* Overview */}
                        <div>
                            <h2 className="text-lg font-semibold mb-3 text-foreground">Overview</h2>
                            <p className="text-muted-foreground leading-relaxed text-sm">
                                {product.description ? (
                                    product.description
                                ) : (
                                    <><span className="font-medium text-foreground">{capitalizeFirstLetter(product.name)}</span> is a {product.plant_nutrition_category?.name?.toLowerCase() || 'plant nutrition product'} designed to support crop health and productivity.</>
                                )}
                            </p>
                        </div>

                        {/* Active Ingredients */}
                        <div>
                            <h2 className="text-lg font-semibold mb-1 text-foreground">Active Ingredients</h2>
                            <ActiveIngredientsList activeIngredients={product.active_ingredients || []} />
                        </div>

                        <AdSenseInFeed />

                        {/* Used On */}
                        {product.dosage_rates && product.dosage_rates.length > 0 && (
                            <div className="rounded-xl border bg-card p-4">
                                <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-3">
                                    Used On
                                </h2>
                                <ul className="space-y-1.5">
                                    {Array.from(new Set(product.dosage_rates.map((rate: any) => rate.crop_group))).map((crop: any, idx: number) => (
                                        <li key={idx} className="flex items-center gap-2 text-sm text-foreground">
                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400 flex-shrink-0" />
                                            <span className="capitalize">{crop}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* Application Rates */}
                {product.dosage_rates && product.dosage_rates.length > 0 && (
                    <FertilizerApplicationRates dosageRates={product.dosage_rates} />
                )}

                {/* Product Labels */}
                {(product.front_label?.img?.src || product.back_label?.img?.src) && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-6">Product Labels</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {product.front_label?.img?.src && (
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold">Front Label</h3>
                                    <div className="relative aspect-[3/4] bg-white rounded-lg border overflow-hidden">
                                        <Image
                                            src={product.front_label.img.src}
                                            alt={`${product.name} - Front Label`}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            className="object-contain p-4"
                                        />
                                    </div>
                                </div>
                            )}
                            {product.back_label?.img?.src && (
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold">Back Label</h3>
                                    <div className="relative aspect-[3/4] bg-white rounded-lg border overflow-hidden">
                                        <Image
                                            src={product.back_label.img.src}
                                            alt={`${product.name} - Back Label`}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            className="object-contain p-4"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Safety Warning */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold mb-2 text-yellow-900 dark:text-yellow-100">Safety Information</h3>
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                Always read and follow label directions. Wear appropriate personal protective equipment (PPE) when handling plant nutrition products.
                                Store in original containers in a secure location away from children and animals. Dispose of containers properly according to local regulations.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
