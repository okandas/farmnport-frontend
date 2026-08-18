import type { Metadata } from 'next'
import { ActiveIngredientsList } from "@/components/shared/ActiveIngredientUnitsKey"
import { capitalizeFirstLetter, buildGuideMetadata } from "@/lib/utilities"
import { BaseURL } from "@/lib/schemas"
import { FertilizerApplicationRates } from "@/components/agrochemical/FertilizerApplicationRates"
import { AgrochemicalDosageTable } from "@/components/agrochemical/AgrochemicalDosageTable"
import { GuideDetailLayout } from "@/components/shared/GuideDetailLayout"
import { RelatedGuideProducts } from "@/components/sections/related-guide-products"
import { ProductNotFound } from "@/components/shared/ProductNotFound"
import { WantToBuyCTA } from "@/components/shared/WantToBuyCTA"

type Props = { params: Promise<{ category: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params
  const res = await fetch(`${BaseURL}/plantnutrition/${slug}`, { cache: "no-store" }).catch(() => null)
  const product = res?.ok ? await res.json() : null

  if (!product) {
    return { title: 'Plant Nutrition Guide | farmnport.com', robots: { index: false } }
  }

  const categoryName = product.plant_nutrition_category?.name || category.replace(/-/g, ' ')
  const categorySingular = categoryName.toLowerCase().replace(/izers$/, 'izer').replace(/ients$/, 'ient').replace(/s$/, '')
  const categorySingularTitle = categorySingular.charAt(0).toUpperCase() + categorySingular.slice(1)
  const article = /^[aeiou]/i.test(categorySingular) ? 'an' : 'a'
  const crops = Array.from(new Set<string>((product.dosage_rates ?? []).slice(0, 3).map((r: any) => r.crop))).join(', ')
  const ingredients = (product.active_ingredients ?? []).slice(0, 2).map((ai: any) => ai.name).join(', ')
  const brand = product.brand?.name ? ` by ${product.brand.name}` : ''

  const description = [
    `${product.name}${brand} is ${article} ${categorySingular} for Zimbabwe crops`,
    ingredients ? `containing ${ingredients}` : null,
    crops ? `for use on ${crops}` : null,
    'View application rates and usage guidelines on farmnport.com.',
  ].filter(Boolean).join('. ')

  const keywords = `${product.name.toLowerCase()}, ${categorySingular} zimbabwe, ${ingredients ? ingredients.toLowerCase() + ', ' : ''}${crops ? crops.toLowerCase() + ', ' : ''}plant nutrition guide zimbabwe, ${category} application rates`

  return buildGuideMetadata(product, categorySingularTitle, 'Application Rates & Guide', description, `/plant-nutrition-guides/${category}/${slug}`, product.images?.[0]?.img?.src, keywords)
}

const DISCLAIMER = "Disclaimer: The information provided on this page, including active ingredients, dosage rates, application methods, and safety guidelines, has been compiled from publicly available product labels, manufacturer datasheets, and other third-party sources. Farmnport does not manufacture, formulate, or independently verify the accuracy, completeness, or currency of this information. Product formulations, registrations, and label directions may change without notice. Always refer to the official product label accompanying the purchased product for the most up-to-date and legally binding instructions. Farmnport accepts no liability for any loss, damage, crop injury, or adverse outcome arising from the use of, or reliance on, the information presented here. Use of any product is entirely at the user's own risk."

const fetchOptions: RequestInit = { cache: "no-store" }

interface GuidePageProps {
    params: Promise<{ category: string; slug: string }>
}

export default async function PlantNutritionGuidePage({ params }: GuidePageProps) {
    const { category, slug } = await params
    const res = await fetch(`${BaseURL}/plantnutrition/${slug}`, fetchOptions)
    const product = res.ok ? await res.json() : null

    if (!product) {
        return <ProductNotFound title="Plant Nutrition Guide Not Found" description="The plant nutrition guide you're looking for doesn't exist or may have been removed." primary={{ href: "/plant-nutrition-guides", label: "Browse All Guides" }} secondary={{ href: "/plant-nutrition-guides", label: "Go to Categories" }} />
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'
    const url = `${baseUrl}/plant-nutrition-guides/${category}/${slug}`
    const imageUrl = product.images?.[0]?.img?.src || `${baseUrl}/default-chemical.png`

    const description = product.plant_nutrition_category?.name
        ? `${product.name} is a ${product.plant_nutrition_category.name}. View composition and application rates.`
        : `Plant nutrition guide for ${product.name}. Complete information on composition and application rates.`

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
            { "@type": "ListItem", "position": 2, "name": "Plant Nutrition Guides", "item": "https://farmnport.com/plant-nutrition-guides" },
            { "@type": "ListItem", "position": 3, "name": product.plant_nutrition_category?.name || category, "item": `https://farmnport.com/plant-nutrition-guides/${product.plant_nutrition_category?.slug || category}` },
            { "@type": "ListItem", "position": 4, "name": product.name, "item": url },
        ],
    }

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
            "name": "Composition",
            "value": `${ai.name} (${ai.dosage_value} ${ai.dosage_unit})`
        })) || [],
        "brand": product.brand ? { "@type": "Brand", "name": product.brand.name } : undefined,
    }

    const dosageTable = product.dosage_rates?.length > 0 ? (
        product.dosage_rates.every((r: any) => !r.crop_group_id && r.crop_group)
            ? <FertilizerApplicationRates dosageRates={product.dosage_rates} />
            : <AgrochemicalDosageTable dosageRates={product.dosage_rates} />
    ) : null

    return (
        <GuideDetailLayout
            product={product}
            breadcrumbs={[
                { label: "Plant Nutrition Guides", href: "/plant-nutrition-guides" },
                { label: product.plant_nutrition_category?.name || category, href: `/plant-nutrition-guides/${product.plant_nutrition_category?.slug || category}` },
                { label: product.name, href: url },
            ]}
            categoryBadge={product.plant_nutrition_category ? { label: product.plant_nutrition_category.name, color: "green" } : undefined}
            buyHref={`/buy-plant-nutrition/${slug}`}
            interestHref={`/interest/plant-nutrition/${slug}`}
            safetyText="Always read and follow label directions. Wear appropriate personal protective equipment (PPE) when handling plant nutrition products. Store in original containers in a secure location away from children and animals. Dispose of containers properly according to local regulations."
            disclaimerText={DISCLAIMER}
            structuredData={structuredData}
            breadcrumbJsonLd={breadcrumbJsonLd}
            bottomContent={dosageTable}
            afterContent={
                <RelatedGuideProducts
                    collection="plant_nutrition"
                    categoryName={product.plant_nutrition_category?.name || category}
                    currentSlug={slug}
                    targetCrops={Array.from(new Set((product.dosage_rates || []).map((r: any) => r.crop).filter(Boolean)))}
                />
            }
        >
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

            {/* Want to Buy CTA */}
            <WantToBuyCTA
                available_for_sale={product.available_for_sale}
                name={product.name}
                brand={product.brand?.name}
                href={`/buy-plant-nutrition/${slug}`}
                interestHref={`/interest/plant-nutrition/${slug}`}
            />

            {/* Composition (not "Active Ingredients" for plant nutrition) */}
            <div>
                <h2 className="text-lg font-semibold mb-1 text-foreground">Composition</h2>
                <ActiveIngredientsList activeIngredients={product.active_ingredients || []} />
            </div>

            {/* Used On */}
            {product.dosage_rates && product.dosage_rates.length > 0 && (
                <div className="rounded-xl border bg-card p-4 sm:h-[150px] overflow-y-auto">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-3">
                        Used On
                    </h2>
                    <ul className="space-y-1.5">
                        {Array.from(new Set(product.dosage_rates.flatMap((rate: any) => {
                            if (rate.crop_group_items?.length > 0) return rate.crop_group_items
                            if (rate.crop) return [rate.crop]
                            if (rate.crop_group) return [rate.crop_group]
                            return []
                        }))).map((crop: any, idx: number) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-foreground">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400 flex-shrink-0" />
                                <span className="capitalize">{crop}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </GuideDetailLayout>
    )
}
