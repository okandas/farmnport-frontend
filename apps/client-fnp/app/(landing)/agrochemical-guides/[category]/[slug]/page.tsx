import type { Metadata } from 'next'
import { serverFetch } from "@/lib/serverFetch"
import { ActiveIngredientsList } from "@/components/shared/ActiveIngredientUnitsKey"
import { capitalizeFirstLetter, buildGuideMetadata } from "@/lib/utilities"
import { ProductNotFound } from "@/components/shared/ProductNotFound"
import { guardTestItem } from "@/lib/guardTestItem"
import { SprayProgramBackLink } from "./SprayProgramBackLink"
import { FertilizerApplicationRates } from "@/components/agrochemical/FertilizerApplicationRates"
import { AgrochemicalDosageTable } from "@/components/agrochemical/AgrochemicalDosageTable"
import { ProductTargets } from "@/components/agrochemical/ProductTargets"
import { GuideDetailLayout } from "@/components/shared/GuideDetailLayout"
import { RelatedGuideProducts } from "@/components/sections/related-guide-products"
import { WantToBuyCTA } from "@/components/shared/WantToBuyCTA"

type Props = { params: Promise<{ category: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params
  const chemical = await serverFetch(`/agrochemical/${slug}`).catch(() => null)

  if (!chemical) {
    return { title: 'Agrochemical Guide | farmnport.com', robots: { index: false } }
  }

  const categoryName = chemical.agrochemical_category?.name || category.replace(/-/g, ' ')
  const categorySingular = categoryName.toLowerCase().replace(/icides$/, 'icide').replace(/izers$/, 'izer').replace(/s$/, '')
  const categorySingularTitle = categorySingular.charAt(0).toUpperCase() + categorySingular.slice(1)
  const article = /^[aeiou]/i.test(categorySingular) ? 'an' : 'a'
  const crops = Array.from(new Set<string>((chemical.dosage_rates ?? []).slice(0, 3).map((r: any) => r.crop))).join(', ')
  const ingredients = (chemical.active_ingredients ?? []).slice(0, 2).map((ai: any) => ai.name).join(', ')
  const brand = chemical.brand?.name ? ` by ${chemical.brand.name}` : ''

  const description = [
    `${chemical.name}${brand} is ${article} ${categorySingular} for Zimbabwe farmers`,
    ingredients ? `containing ${ingredients}` : null,
    crops ? `used on ${crops}` : null,
    'View dosage rates, label information, and application guidelines on farmnport.com.',
  ].filter(Boolean).join('. ')

  const keywords = `${chemical.name.toLowerCase()}, ${categorySingular} zimbabwe, ${ingredients ? ingredients.toLowerCase() + ', ' : ''}${crops ? crops.toLowerCase() + ', ' : ''}agrochemical guide zimbabwe, ${category} dosage rates`

  return buildGuideMetadata(chemical, categorySingularTitle, 'Dosage, Label & Guide', description, `/agrochemical-guides/${category}/${slug}`, chemical.images?.[0]?.img?.src, keywords)
}

const overviewDesc: Record<string, string> = {
    herbicides: "a herbicide used for weed management and control. It helps suppress unwanted weed growth while protecting crops when applied according to recommended guidelines.",
    insecticides: "an insecticide formulated for effective pest control. It targets harmful insects while maintaining crop safety when used as directed.",
    fungicides: "a fungicide designed to prevent and control fungal diseases. It provides protective and curative action to keep crops healthy throughout the growing season.",
    acaricides: "an acaricide developed for mite and tick control. It effectively manages mite populations while being safe for crops when applied correctly.",
    nematicides: "a nematicide used to control plant-parasitic nematodes. It protects root systems and promotes healthy crop development.",
    rodenticides: "a rodenticide formulated for rodent control in agricultural settings. It helps protect stored crops and field produce from rodent damage.",
    molluscicides: "a molluscicide designed to control snails and slugs. It protects crops from mollusc damage during vulnerable growth stages.",
    bactericides: "a bactericide used to manage bacterial infections in crops. It helps prevent the spread of bacterial diseases and supports plant health.",
}

const targetLabel: Record<string, string> = {
    herbicides: "Target Weeds",
    insecticides: "Target Pests",
    fungicides: "Target Diseases",
    acaricides: "Target Mites & Ticks",
    nematicides: "Target Nematodes",
    rodenticides: "Target Rodents",
    molluscicides: "Target Molluscs",
    bactericides: "Target Bacteria",
    "foliar-feeds": "Targets",
    fertilizers: "Targets",
    "plant-nutrition": "Targets",
    biostimulants: "Targets",
}

const DISCLAIMER = "Disclaimer: The information provided on this page, including active ingredients, dosage rates, application methods, and safety guidelines, has been compiled from publicly available product labels, manufacturer datasheets, and other third-party sources. Farmnport does not manufacture, formulate, or independently verify the accuracy, completeness, or currency of this information. Product formulations, registrations, and label directions may change without notice. Always refer to the official product label accompanying the purchased product for the most up-to-date and legally binding instructions. Farmnport accepts no liability for any loss, damage, crop injury, or adverse outcome arising from the use of, or reliance on, the information presented here. Use of any agrochemical product is entirely at the user's own risk."

interface GuidePageProps {
    params: Promise<{ category: string; slug: string }>
}

export default async function AgroChemicalGuidePage({ params }: GuidePageProps) {
    const { category, slug } = await params
    const chemical = await serverFetch(`/agrochemical/${slug}`).catch(() => null)

    await guardTestItem(!!chemical?.is_test)

    if (!chemical) {
        return <ProductNotFound title="AgroChemical Guide Not Found" description="The agrochemical guide you're looking for doesn't exist or may have been removed." primary={{ href: "/agrochemical-guides", label: "Browse AgroChemical Guides" }} secondary={{ href: "/buy-agrochemicals", label: "Buy AgroChemicals" }} />
    }

    const categorySlug = chemical?.agrochemical_category?.slug || ""
    const sectionTitle = targetLabel[categorySlug] || "Targets"
    const noTargetMsg = `No ${sectionTitle.toLowerCase()} information available.`

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'
    const url = `${baseUrl}/agrochemical-guides/${category}/${slug}`
    const imageUrl = chemical.images?.[0]?.img?.src || `${baseUrl}/default-chemical.png`

    const description = chemical.agrochemical_category?.name
        ? `${chemical.name} is a ${chemical.agrochemical_category.name} for effective pest and disease control. View active ingredients, dosage rates, and application guidelines.`
        : `Professional agrochemical guide for ${chemical.name}. Complete information on active ingredients, dosage rates, and safe application.`

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
            { "@type": "ListItem", "position": 2, "name": "Agrochemical Guides", "item": "https://farmnport.com/agrochemical-guides" },
            { "@type": "ListItem", "position": 3, "name": chemical.agrochemical_category?.name || category, "item": `https://farmnport.com/agrochemical-guides/${category}` },
            { "@type": "ListItem", "position": 4, "name": chemical.name, "item": url },
        ],
    }

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": chemical.name,
        "description": description,
        "image": imageUrl,
        "category": chemical.agrochemical_category?.name || "Agrochemical",
        "url": url,
        "additionalProperty": [
            ...(chemical.active_ingredients?.map((ai: any) => ({
                "@type": "PropertyValue",
                "name": "Active Ingredient",
                "value": `${ai.name} (${ai.dosage_value} ${ai.dosage_unit})`
            })) || []),
            ...(chemical.targets?.map((target: any) => ({
                "@type": "PropertyValue",
                "name": sectionTitle,
                "value": target.scientific_name ? `${target.name} (${target.scientific_name})` : target.name
            })) || [])
        ],
        "applicationCategory": "Agricultural Chemical",
    }

    const dosageTable = chemical.dosage_rates?.length > 0 ? (
        chemical.dosage_rates.every((r: any) => !r.crop_group_id && r.crop_group)
            ? <FertilizerApplicationRates dosageRates={chemical.dosage_rates} />
            : <AgrochemicalDosageTable dosageRates={chemical.dosage_rates} />
    ) : null

    return (
        <GuideDetailLayout
            product={chemical}
            breadcrumbs={[
                { label: "Agrochemical Guides", href: "/agrochemical-guides" },
                { label: chemical.agrochemical_category?.name || category, href: `/agrochemical-guides/${category}` },
                { label: chemical.name, href: url },
            ]}
            categoryBadge={chemical.agrochemical_category ? { label: chemical.agrochemical_category.name } : undefined}
            buyHref={`/buy-agrochemicals/${slug}`}
            interestHref={`/interest/agrochemical/${slug}`}
            safetyText="Always read and follow label directions. Wear appropriate personal protective equipment (PPE) when handling agrochemicals. Store in original containers in a secure location away from children and animals. Dispose of containers properly according to local regulations."
            disclaimerText={DISCLAIMER}
            structuredData={structuredData}
            breadcrumbJsonLd={breadcrumbJsonLd}
            topContent={<SprayProgramBackLink />}
            bottomContent={dosageTable}
            afterContent={
                <RelatedGuideProducts
                    collection="agro_chemicals"
                    categoryName={chemical.agrochemical_category?.name || category}
                    currentSlug={slug}
                    targets={(chemical.targets || []).map((t: any) => t.name)}
                    targetCrops={Array.from(new Set((chemical.dosage_rates || []).map((r: any) => r.crop).filter(Boolean)))}
                />
            }
        >
            {/* Overview */}
            <div>
                <h2 className="text-lg font-semibold mb-3 text-foreground">Overview</h2>
                <p className="text-muted-foreground leading-relaxed text-sm">
                    {chemical.product_overview ? (
                        chemical.product_overview
                    ) : chemical.agrochemical_category?.slug ? (
                        <><span className="font-medium text-foreground">{capitalizeFirstLetter(chemical.name)}</span> is {overviewDesc[chemical.agrochemical_category.slug] || `a ${chemical.agrochemical_category.name.toLowerCase().replace(/s$/, '')} for effective crop protection. It provides targeted action while ensuring crop safety when used according to recommended guidelines.`}</>
                    ) : (
                        <><span className="font-medium text-foreground">{chemical.name}</span> is a professional agrochemical solution for crop protection and management in agricultural applications.</>
                    )}
                </p>
            </div>

            {/* Want to Buy CTA */}
            <WantToBuyCTA
                available_for_sale={chemical.available_for_sale}
                name={chemical.name}
                brand={chemical.brand?.name}
                href={`/buy-agrochemicals/${slug}`}
                interestHref={`/interest/agrochemical/${slug}`}
            />

            {/* Active Ingredients */}
            <div>
                <h2 className="text-lg font-semibold mb-1 text-foreground">Active Ingredients</h2>
                <ActiveIngredientsList activeIngredients={chemical.active_ingredients || []} />
            </div>

            {/* Used On & Targets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:h-[150px]">
                {chemical.dosage_rates && chemical.dosage_rates.length > 0 && (
                    <div className="rounded-xl border bg-card p-4 overflow-y-auto">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-3">
                            Used On
                        </h2>
                        <ul className="space-y-1.5">
                            {Array.from(new Set(chemical.dosage_rates.flatMap((rate: any) => {
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

                <ProductTargets
                    title={sectionTitle}
                    targets={chemical.targets || []}
                    emptyMessage={noTargetMsg}
                />
            </div>
        </GuideDetailLayout>
    )
}
