import type { Metadata } from 'next'
import { ActiveIngredientsList } from "@/components/shared/ActiveIngredientUnitsKey"
import { capitalizeFirstLetter, formatUnit, buildGuideMetadata } from "@/lib/utilities"
import { BaseURL } from "@/lib/schemas"
import { ProductTargets } from "@/components/agrochemical/ProductTargets"
import { GuideDetailLayout } from "@/components/shared/GuideDetailLayout"
import { RelatedGuideProducts } from "@/components/sections/related-guide-products"
import { ProductNotFound } from "@/components/shared/ProductNotFound"
import { WantToBuyCTA } from "@/components/shared/WantToBuyCTA"

type Props = { params: Promise<{ category: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params
  const res = await fetch(`${BaseURL}/animalhealth/${slug}`, { cache: "no-store" }).catch(() => null)
  const product = res?.ok ? await res.json() : null

  if (!product) {
    return { title: 'Animal Health Product Guide | farmnport.com', robots: { index: false } }
  }

  const categoryName = product.animal_health_category?.name || category.replace(/-/g, ' ')
  const categorySingular = categoryName.toLowerCase().replace(/icides$/, 'icide').replace(/izers$/, 'izer').replace(/s$/, '')
  const categorySingularTitle = categorySingular.charAt(0).toUpperCase() + categorySingular.slice(1)
  const article = /^[aeiou]/i.test(categorySingular) ? 'an' : 'a'
  const usedOn = (product.used_on ?? []).slice(0, 3).join(', ')
  const ingredients = (product.active_ingredients ?? []).slice(0, 2).map((ai: any) => ai.name).join(', ')
  const brand = product.brand?.name ? ` by ${product.brand.name}` : ''

  const description = [
    `${product.name}${brand} is ${article} ${categorySingular}`,
    usedOn ? `for ${usedOn}` : 'for poultry and livestock in Zimbabwe',
    ingredients ? `containing ${ingredients}` : null,
    'View dosage rates and usage guidelines on farmnport.com.',
  ].filter(Boolean).join('. ')

  const keywords = `${product.name.toLowerCase()}, ${categorySingular} zimbabwe, ${ingredients ? ingredients.toLowerCase() + ', ' : ''}${usedOn ? usedOn.toLowerCase() + ', ' : ''}animal health guide zimbabwe, veterinary ${category}`

  return buildGuideMetadata(product, categorySingularTitle, 'Dosage & Guide', description, `/animal-health-guides/${category}/${slug}`, product.images?.[0]?.img?.src, keywords)
}

const overviewDesc: Record<string, string> = {
    vaccines: "a vaccine designed to protect poultry and livestock against infectious diseases. It stimulates the immune system to build resistance when administered according to the recommended schedule.",
    antibiotics: "an antibiotic formulated for the treatment and prevention of bacterial infections in poultry and livestock. It targets harmful bacteria while supporting animal recovery when used as directed.",
    "nutrition-supplements": "a nutritional supplement formulated to support optimal health and productivity in poultry and livestock. It provides essential vitamins, minerals, and nutrients for growth and well-being.",
    "anti-protozoa": "an anti-protozoal product developed for the treatment and prevention of protozoal infections such as coccidiosis. It effectively manages parasitic protozoa in poultry and livestock.",
    "biosecurity-disinfectants": "a biosecurity disinfectant designed for cleaning and sanitizing poultry and livestock housing. It helps eliminate pathogens and maintain a healthy environment.",
}

const DISCLAIMER = "Disclaimer: The information provided on this page, including active ingredients, dosage rates, application methods, and safety guidelines, has been compiled from publicly available product labels, manufacturer datasheets, and other third-party sources. Farmnport does not manufacture, formulate, or independently verify the accuracy, completeness, or currency of this information. Product formulations, registrations, and label directions may change without notice. Always refer to the official product label accompanying the purchased product for the most up-to-date and legally binding instructions. Farmnport accepts no liability for any loss, damage, crop injury, or adverse outcome arising from the use of, or reliance on, the information presented here. Use of any product is entirely at the user's own risk."

const fetchOptions: RequestInit = { cache: "no-store" }

interface GuidePageProps {
    params: Promise<{ category: string; slug: string }>
}

export default async function AnimalHealthGuidePage({ params }: GuidePageProps) {
    const { category, slug } = await params
    const res = await fetch(`${BaseURL}/animalhealth/${slug}`, fetchOptions)
    const product = res.ok ? await res.json() : null

    if (!product) {
        return <ProductNotFound title="Animal Health Guide Not Found" description="The animal health product guide you're looking for doesn't exist or may have been removed." primary={{ href: "/animal-health-guides", label: "Browse All Guides" }} secondary={{ href: "/animal-health-guides", label: "Go to Categories" }} />
    }

    const categorySlug = product?.animal_health_category?.slug || ""
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'
    const url = `${baseUrl}/animal-health-guides/${category}/${slug}`
    const imageUrl = product.images?.[0]?.img?.src || `${baseUrl}/default-chemical.png`

    const description = product.animal_health_category?.name
        ? `${product.name} is a ${product.animal_health_category.name} for poultry and livestock health. View active ingredients, dosage rates, and withdrawal periods.`
        : `Professional animal health product guide for ${product.name}. Complete information on active ingredients, dosage rates, and withdrawal periods.`

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
            { "@type": "ListItem", "position": 2, "name": "Animal Health Guides", "item": "https://farmnport.com/animal-health-guides" },
            { "@type": "ListItem", "position": 3, "name": product.animal_health_category?.name || category, "item": `https://farmnport.com/animal-health-guides/${category}` },
            { "@type": "ListItem", "position": 4, "name": product.name, "item": url },
        ],
    }

    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": description,
        "image": imageUrl,
        "category": product.animal_health_category?.name || "Animal Health Product",
        "url": url,
        "additionalProperty": [
            ...(product.active_ingredients?.map((ai: any) => ({
                "@type": "PropertyValue",
                "name": "Active Ingredient",
                "value": `${ai.name} (${ai.dosage_value} ${ai.dosage_unit})`
            })) || []),
            ...(product.targets?.map((target: any) => ({
                "@type": "PropertyValue",
                "name": "Target Disease/Condition",
                "value": target.scientific_name ? `${target.name} (${target.scientific_name})` : target.name
            })) || [])
        ],
        "applicationCategory": "Veterinary Product",
    }

    // Pre-process dosage rates
    const grouped = new Map<string, any[]>()
    const ungrouped: any[] = []
    if (product.dosage_rates) {
        product.dosage_rates.forEach((rate: any) => {
            if (rate.animal_group_id) {
                const existing = grouped.get(rate.animal_group_id) || []
                existing.push(rate)
                grouped.set(rate.animal_group_id, existing)
            } else {
                ungrouped.push(rate)
            }
        })
    }
    const targetGrouped = new Map<string, any[]>()
    const targetOrder: string[] = []
    ungrouped.forEach((rate: any) => {
        const key = Array.isArray(rate.targets) ? rate.targets.slice().sort().join("|") : ""
        if (!targetGrouped.has(key)) {
            targetGrouped.set(key, [])
            targetOrder.push(key)
        }
        targetGrouped.get(key)!.push(rate)
    })

    const renderTargetGrid = (targets: string[]) => (
        <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            {targets.map((t: string, i: number) => {
                const parenIdx = t.indexOf(" (")
                const mainName = parenIdx > -1 ? t.slice(0, parenIdx) : t
                const sciName = parenIdx > -1 ? t.slice(parenIdx) : ""
                return (
                    <div key={i} className="text-sm flex items-start gap-1">
                        <span className="h-1 w-1 mt-1.5 rounded-full bg-muted-foreground/50 flex-shrink-0" />
                        <span>
                            <span className="text-foreground">{mainName}</span>
                            {sciName && <span className="text-muted-foreground text-xs">{sciName}</span>}
                        </span>
                    </div>
                )
            })}
        </div>
    )

    const renderEntryRows = (rate: any, rateKey: string, animalCell: React.ReactNode, targetCell: React.ReactNode) => {
        const entries = rate.entries || []
        const lastIdx = entries.length - 1
        return entries.map((entry: any, entryIdx: number) => (
            <tr key={`${rateKey}-${entryIdx}`} className={`hover:bg-muted/30 transition-colors ${entryIdx === 0 ? "border-t border-border" : ""} ${entryIdx === lastIdx ? "border-b border-border" : ""}`}>
                <td className="p-3 align-top">{entryIdx === 0 ? animalCell : null}</td>
                <td className="p-3 align-top">{entryIdx === 0 ? targetCell : null}</td>
                <td className="p-3 align-top">
                    <div className="font-bold text-blue-600 dark:text-blue-400 text-base">{entry.dosage.value} {formatUnit(entry.dosage.unit)}</div>
                    <div className="text-xs text-muted-foreground">per {entry.dosage.per}</div>
                </td>
                <td className="p-3 align-top">
                    <div className="font-semibold text-orange-700 dark:text-orange-300">{entry.max_applications.max > 0 ? entry.max_applications.max : "—"}</div>
                    {entry.max_applications.note?.trim() && <div className="text-xs text-muted-foreground mt-1">{entry.max_applications.note}</div>}
                </td>
                <td className="p-3 align-top">
                    <div className="font-semibold text-teal-700 dark:text-teal-300 text-sm">{entry.application_interval}</div>
                </td>
                <td className="p-3 align-top">
                    {Array.isArray(entry.withdrawal_period) && entry.withdrawal_period.length > 0 ? (
                        <ul className="space-y-1">
                            {entry.withdrawal_period.map((wp: string, wpIdx: number) => (
                                <li key={wpIdx} className="text-sm text-rose-700 dark:text-rose-300 flex items-start gap-1.5">
                                    <span className="h-1 w-1 mt-1.5 rounded-full bg-rose-500/50 flex-shrink-0" />
                                    <span className="flex-1">{wp}</span>
                                </li>
                            ))}
                        </ul>
                    ) : <span className="text-xs text-muted-foreground">&mdash;</span>}
                </td>
                <td className="p-3 align-top">
                    {entry.remarks?.length > 0 ? (
                        <ul className="space-y-1">
                            {entry.remarks.map((remark: string, remarkIdx: number) => (
                                <li key={remarkIdx} className="text-xs text-foreground flex items-start gap-1.5">
                                    <span className="h-1 w-1 mt-1.5 rounded-full bg-foreground/50 flex-shrink-0" />
                                    <span className="flex-1">{remark}</span>
                                </li>
                            ))}
                        </ul>
                    ) : <span className="text-xs text-muted-foreground">&mdash;</span>}
                </td>
            </tr>
        ))
    }

    const dosageTable = product.dosage_rates?.length > 0 ? (
        <div className="mb-12">
            <h2 className="sticky top-16 z-10 text-2xl font-bold py-4 text-foreground bg-background">Dosage Rates & Application Guide</h2>
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-b-2 border-blue-200 dark:border-blue-800">
                            <th className="text-left p-3 text-sm font-semibold text-blue-900 dark:text-blue-100 min-w-[120px]">Animal</th>
                            <th className="text-left p-3 text-sm font-semibold text-blue-900 dark:text-blue-100 min-w-[180px]">Target</th>
                            <th className="text-left p-3 text-sm font-semibold text-blue-900 dark:text-blue-100 min-w-[140px]">Dosage</th>
                            <th className="text-left p-3 text-sm font-semibold text-orange-700 dark:text-orange-300 min-w-[120px] whitespace-nowrap">Max Applications</th>
                            <th className="text-left p-3 text-sm font-semibold text-teal-700 dark:text-teal-300 min-w-[130px] whitespace-nowrap">Application Interval</th>
                            <th className="text-left p-3 text-sm font-semibold text-rose-700 dark:text-rose-300 min-w-[120px] whitespace-nowrap">Withdrawal Period</th>
                            <th className="text-left p-3 text-sm font-semibold text-blue-900 dark:text-blue-100 min-w-[180px]">Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from(grouped.entries()).map(([groupId, rates]) => {
                            const firstRate = rates[0]
                            const animalCell = (
                                <div>
                                    <div className="font-semibold text-sm text-blue-700 dark:text-blue-300">{firstRate.animal_group}</div>
                                    <div className="mt-1 space-y-0.5">
                                        {rates.map((r: any, idx: number) => (
                                            <div key={idx} className="text-xs text-muted-foreground capitalize flex items-start gap-1">
                                                <span className="h-1 w-1 mt-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                                <span className="flex-1">{r.animal}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                            return renderEntryRows(firstRate, `group-${groupId}`, animalCell, renderTargetGrid(firstRate.targets || []))
                        })}
                        {targetOrder.map((targetKey, tgIdx) => {
                            const rates = targetGrouped.get(targetKey)!
                            if (rates.length === 1) {
                                const rate = rates[0]
                                return renderEntryRows(rate, `tg-${tgIdx}`, <div className="font-semibold capitalize text-sm text-foreground">{rate.animal}</div>, renderTargetGrid(rate.targets || []))
                            }
                            return rates.map((rate: any, rateIdx: number) => renderEntryRows(rate, `tg-${tgIdx}-${rateIdx}`, <div className="font-semibold capitalize text-sm text-foreground">{rate.animal}</div>, rateIdx === 0 ? renderTargetGrid(rate.targets || []) : null))
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    ) : null

    return (
        <GuideDetailLayout
            product={product}
            breadcrumbs={[
                { label: "Animal Health Guides", href: "/animal-health-guides" },
                { label: product.animal_health_category?.name || category, href: `/animal-health-guides/${category}` },
                { label: product.name, href: url },
            ]}
            categoryBadge={product.animal_health_category ? { label: product.animal_health_category.name } : undefined}
            buyHref={`/buy-animal-health/${slug}`}
            interestHref={`/interest/animal-health/${slug}`}
            safetyText="Always read and follow label directions. Consult a veterinarian before administering animal health products. Observe withdrawal periods before slaughter or sale of animal products. Store in original containers in a cool, dry place away from children."
            disclaimerText={DISCLAIMER}
            structuredData={structuredData}
            breadcrumbJsonLd={breadcrumbJsonLd}
            bottomContent={dosageTable}
            afterContent={
                <RelatedGuideProducts
                    collection="animal_health"
                    categoryName={product.animal_health_category?.name || category}
                    currentSlug={slug}
                    targets={(product.targets || []).map((t: any) => t.name)}
                    targetAnimals={(product.target_animals || []).map((t: any) => t.name || t)}
                />
            }
        >
            {/* Overview */}
            <div>
                <h2 className="text-lg font-semibold mb-3 text-foreground">Overview</h2>
                <p className="text-muted-foreground leading-relaxed text-sm">
                    {categorySlug ? (
                        <><span className="font-medium text-foreground">{capitalizeFirstLetter(product.name)}</span> is {overviewDesc[categorySlug] || `a ${product.animal_health_category?.name?.toLowerCase() || 'veterinary'} product for effective animal health management. It supports animal health when used according to recommended guidelines.`}</>
                    ) : (
                        <><span className="font-medium text-foreground">{product.name}</span> is a professional animal health product for poultry and livestock management.</>
                    )}
                </p>
            </div>

            {/* Want to Buy CTA */}
            <WantToBuyCTA
                available_for_sale={product.available_for_sale}
                name={product.name}
                brand={product.brand?.name}
                href={`/buy-animal-health/${slug}`}
                interestHref={`/interest/animal-health/${slug}`}
            />

            {/* Active Ingredients */}
            <div>
                <h2 className="text-lg font-semibold mb-1 text-foreground">Active Ingredients</h2>
                <ActiveIngredientsList activeIngredients={product.active_ingredients || []} />
            </div>

            {/* Used On & Targets Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.dosage_rates && product.dosage_rates.length > 0 && (
                    <div className="rounded-xl border bg-card p-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-3">Used On</h2>
                        <ul className="space-y-1.5">
                            {Array.from(new Set(product.dosage_rates.map((rate: any) => rate.animal))).map((animal: any, idx: number) => (
                                <li key={idx} className="flex items-center gap-2 text-sm text-foreground">
                                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400 flex-shrink-0" />
                                    <span className="capitalize">{animal}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <ProductTargets title="Target Diseases & Conditions" targets={product.targets || []} emptyMessage="No target disease information available." />
            </div>
        </GuideDetailLayout>
    )
}
