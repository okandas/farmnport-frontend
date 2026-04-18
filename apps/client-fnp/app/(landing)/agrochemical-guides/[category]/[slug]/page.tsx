import { queryAgroChemical } from "@/lib/query"
import Image from "next/image"
import { Beaker, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { AdSenseInFeed } from "@/components/ads/AdSenseInFeed"
import { capitalizeFirstLetter, formatUnit } from "@/lib/utilities"
import { SprayProgramBackLink } from "./SprayProgramBackLink"
import { BuyNowButton } from "./BuyNowButton"

interface GuidePageProps {
    params: Promise<{
        category: string
        slug: string
    }>
}

export default async function AgroChemicalGuidePage({ params }: GuidePageProps) {
    const { category, slug } = await params

    const response = await queryAgroChemical(slug)
    const chemical = response?.data

    const categorySlug = chemical?.agrochemical_category?.slug || ""
    const targetLabel: Record<string, string> = {
        herbicides: "Target Weeds",
        insecticides: "Target Pests",
        fungicides: "Target Diseases",
        acaricides: "Target Mites & Ticks",
        nematicides: "Target Nematodes",
        rodenticides: "Target Rodents",
        molluscicides: "Target Molluscs",
        bactericides: "Target Bacteria",
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
    const sectionTitle = targetLabel[categorySlug] || "Target Pests & Diseases"
    const noTargetMsg = targetLabel[categorySlug]
        ? `No ${sectionTitle.toLowerCase().replace("target ", "")} information available.`
        : "No target pest or disease information available."

    if (!chemical) {
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
                        We couldn&apos;t find the agrochemical guide you&apos;re looking for. It may have been removed or the link might be incorrect.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/agrochemical-guides/all">
                            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                                Browse All Guides
                            </button>
                        </Link>
                        <Link href="/agrochemical-guides">
                            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                                Go to Categories
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // Generate JSON-LD structured data
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'
    const url = `${baseUrl}/agrochemical-guides/${category}/${slug}`
    const imageUrl = chemical.images?.[0]?.img?.src || `${baseUrl}/default-chemical.png`

    const description = chemical.agrochemical_category?.name
        ? `${chemical.name} is a ${chemical.agrochemical_category.name} for effective pest and disease control. View active ingredients, dosage rates, and application guidelines.`
        : `Professional agrochemical guide for ${chemical.name}. Complete information on active ingredients, dosage rates, and safe application.`

    const usageInfo = chemical.dosage_rates?.length > 0
        ? `Dosage rates available for ${chemical.dosage_rates.map((r: any) => r.crop).join(', ')}`
        : undefined

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
        "usageInfo": usageInfo
    }

    return (
        <div className="min-h-screen bg-background">
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            {/* Back to Spray Program */}
            <SprayProgramBackLink />

            {/* Breadcrumb */}
            <div className="border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/agrochemical-guides/all" className="hover:text-foreground">Guides</Link>
                        <span className="mx-2">/</span>
                        <Link href={`/agrochemical-guides/${category}`} className="hover:text-foreground capitalize">{chemical.agrochemical_category?.name || category}</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground capitalize">{chemical.name}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="grid lg:grid-cols-[450px,1fr] gap-12 mb-16">
                    {/* Left - Image */}
                    <div className="space-y-4">
                        <div className="relative aspect-square bg-white rounded-xl border overflow-hidden shadow-sm">
                            {chemical.images && chemical.images[0] && chemical.images[0].img?.src ? (
                                <Image
                                    src={chemical.images[0].img.src}
                                    alt={chemical.name}
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

                        {/* Thumbnail Gallery - if multiple images */}
                        {chemical.images && chemical.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-3">
                                {chemical.images.slice(0, 4).map((img: any, idx: number) => (
                                    <div
                                        key={idx}
                                        className="relative aspect-square bg-white rounded-lg border hover:border-primary transition-colors"
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

                        <BuyNowButton slug={slug} />
                    </div>

                    {/* Right - Product Info */}
                    <div className="space-y-6">
                        {/* Product Name */}
                        <h1 className="text-3xl lg:text-4xl font-bold capitalize leading-tight">
                            {chemical.name}
                        </h1>

                        {/* Category Badge & Buy Link */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {chemical.agrochemical_category && (
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                    {chemical.agrochemical_category.name}
                                </div>
                            )}
                            {/* <Link
                                href={`/buy-agrochemicals/${slug}`}
                                className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                                Ready to Buy
                            </Link> */}
                        </div>

                        {/* Variants / Pack Sizes */}
                        {chemical.variants && chemical.variants.length > 0 && (
                            <div>
                                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">Pack Sizes & Pricing</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {chemical.variants.map((variant: any, idx: number) => (
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

                        {/* Fallback single price */}
                        {(!chemical.variants || chemical.variants.length === 0) && chemical.show_price && chemical.sale_price > 0 && (
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground">Guide Price:</span>
                                {chemical.was_price > 0 && chemical.was_price > chemical.sale_price && (
                                    <span className="text-lg text-muted-foreground line-through">${(chemical.was_price / 100).toFixed(2)}</span>
                                )}
                                <span className="text-2xl font-bold text-primary">${(chemical.sale_price / 100).toFixed(2)}</span>
                            </div>
                        )}

                        {/* Divider */}
                        <div className="h-px bg-border" />

                        {/* Overview */}
                        <div>
                            <h2 className="text-lg font-semibold mb-3 text-foreground">Overview</h2>
                            <p className="text-muted-foreground leading-relaxed text-sm">
                                {chemical.agrochemical_category?.slug ? (
                                    <><span className="font-medium text-foreground">{capitalizeFirstLetter(chemical.name)}</span> is {overviewDesc[chemical.agrochemical_category.slug] || `a ${chemical.agrochemical_category.name.toLowerCase().replace(/s$/, '')} for effective crop protection. It provides targeted action while ensuring crop safety when used according to recommended guidelines.`}</>
                                ) : (
                                    <><span className="font-medium text-foreground">{chemical.name}</span> is a professional agrochemical solution for crop protection and management in agricultural applications.</>
                                )}
                            </p>
                        </div>

                        {/* Active Ingredients Section */}
                        <div>
                            <h2 className="text-lg font-semibold mb-3 text-foreground">
                                Active Ingredients
                            </h2>
                            {chemical.active_ingredients && chemical.active_ingredients.length > 0 ? (
                                <div className="space-y-2">
                                    {chemical.active_ingredients.map((ai: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50/50 to-transparent dark:from-purple-950/30 rounded-lg border border-purple-100 dark:border-purple-900 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
                                            <div className="font-medium capitalize text-sm text-foreground">{ai.name}</div>
                                            <div className="text-right">
                                                <div className="font-bold text-purple-600 dark:text-purple-400">{ai.dosage_value} {ai.dosage_unit}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg border">No active ingredient information available.</p>
                            )}
                        </div>

                        {/* AdSense Ad */}
                        <AdSenseInFeed />

                        {/* Used On & Targets Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Used On Section */}
                            {chemical.dosage_rates && chemical.dosage_rates.length > 0 && (
                                <div className="rounded-xl border bg-card p-4">
                                    <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-3">
                                        Used On
                                    </h2>
                                    <ul className="space-y-1.5">
                                        {Array.from(new Set(chemical.dosage_rates.map((rate: any) => rate.crop))).map((crop: any, idx: number) => (
                                            <li key={idx} className="flex items-center gap-2 text-sm text-foreground">
                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400 flex-shrink-0" />
                                                <span className="capitalize">{crop}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Target Pests & Diseases Section */}
                            <div className="rounded-xl border bg-card p-4">
                                <h2 className="text-sm font-semibold uppercase tracking-wide text-green-700 dark:text-green-400 mb-3">
                                    {sectionTitle}
                                </h2>
                                {chemical.targets && chemical.targets.length > 0 ? (
                                    <ul className="space-y-1.5">
                                        {chemical.targets.map((target: any, idx: number) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                                                <span className="h-1.5 w-1.5 rounded-full bg-green-500 dark:bg-green-400 flex-shrink-0 mt-1.5" />
                                                <span>
                                                    <span className="capitalize">{target.name}</span>
                                                    {target.scientific_name && (
                                                        <span className="text-xs text-muted-foreground italic ml-1">({target.scientific_name})</span>
                                                    )}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-muted-foreground">{noTargetMsg}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dosage Rates & Application Guide Section */}
                {chemical.dosage_rates && chemical.dosage_rates.length > 0 && (
                    <div className="mb-12">
                        <h2 className="sticky top-16 z-10 text-2xl font-bold py-4 text-foreground bg-background">Dosage Rates & Application Guide</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-b-2 border-blue-200 dark:border-blue-800">
                                        <th className="text-left p-3 text-sm font-semibold text-blue-900 dark:text-blue-100 min-w-[120px]">Crop</th>
                                        <th className="text-left p-3 text-sm font-semibold text-blue-900 dark:text-blue-100 min-w-[180px]">Target</th>
                                        <th className="text-left p-3 text-sm font-semibold text-blue-900 dark:text-blue-100 min-w-[140px]">Dosage</th>
                                        <th className="text-left p-3 text-sm font-semibold text-orange-700 dark:text-orange-300 min-w-[120px] whitespace-nowrap">Max Applications</th>
                                        <th className="text-left p-3 text-sm font-semibold text-teal-700 dark:text-teal-300 min-w-[130px] whitespace-nowrap">Application Interval</th>
                                        <th className="text-left p-3 text-sm font-semibold text-rose-700 dark:text-rose-300 min-w-[60px]">PHI</th>
                                        <th className="text-left p-3 text-sm font-semibold text-blue-900 dark:text-blue-100 min-w-[180px]">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const grouped = new Map<string, any[]>()
                                        const ungrouped: any[] = []

                                        chemical.dosage_rates.forEach((rate: any) => {
                                            if (rate.crop_group_id) {
                                                const existing = grouped.get(rate.crop_group_id) || []
                                                existing.push(rate)
                                                grouped.set(rate.crop_group_id, existing)
                                            } else {
                                                ungrouped.push(rate)
                                            }
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

                                        const renderEntryRows = (rate: any, rateKey: string, cropCell: React.ReactNode, targetCell: React.ReactNode) => {
                                            const entries = rate.entries || []
                                            const lastIdx = entries.length - 1
                                            return entries.map((entry: any, entryIdx: number) => (
                                                <tr key={`${rateKey}-${entryIdx}`} className={`hover:bg-muted/30 transition-colors ${entryIdx === 0 ? "border-t border-border" : ""} ${entryIdx === lastIdx ? "border-b border-border" : ""}`}>
                                                    <td className="p-3 align-top">
                                                        {entryIdx === 0 ? cropCell : null}
                                                    </td>
                                                    <td className="p-3 align-top">
                                                        {entryIdx === 0 ? targetCell : null}
                                                    </td>
                                                    <td className="p-3 align-top">
                                                        <div className="font-bold text-blue-600 dark:text-blue-400 text-base">
                                                            {entry.dosage.value} {formatUnit(entry.dosage.unit)}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">per {entry.dosage.per}</div>
                                                    </td>
                                                    <td className="p-3 align-top">
                                                        <div className="font-semibold text-orange-700 dark:text-orange-300">{entry.max_applications.max}</div>
                                                        {entry.max_applications.note && entry.max_applications.note.trim() !== '' && (
                                                            <div className="text-xs text-muted-foreground mt-1">{entry.max_applications.note}</div>
                                                        )}
                                                    </td>
                                                    <td className="p-3 align-top">
                                                        <div className="font-semibold text-teal-700 dark:text-teal-300 text-sm">{entry.application_interval}</div>
                                                    </td>
                                                    <td className="p-3 align-top">
                                                        <div className="font-semibold text-rose-700 dark:text-rose-300 text-sm">{entry.phi}</div>
                                                    </td>
                                                    <td className="p-3 align-top">
                                                        {entry.remarks && entry.remarks.length > 0 ? (
                                                            <ul className="space-y-1">
                                                                {entry.remarks.map((remark: string, remarkIdx: number) => (
                                                                    <li key={remarkIdx} className="text-xs text-foreground flex items-start gap-1.5">
                                                                        <span className="h-1 w-1 mt-1.5 rounded-full bg-foreground/50 flex-shrink-0" />
                                                                        <span className="flex-1">{remark}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">&mdash;</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        }

                                        return (
                                            <>
                                                {/* Grouped rates - show group name with crops listed */}
                                                {Array.from(grouped.entries()).map(([groupId, rates]) => {
                                                    const firstRate = rates[0]
                                                    const cropCell = (
                                                        <div>
                                                            <div className="font-semibold text-sm text-blue-700 dark:text-blue-300">
                                                                {firstRate.crop_group}
                                                            </div>
                                                            <div className="mt-1 space-y-0.5">
                                                                {rates.map((r: any, idx: number) => (
                                                                    <div key={idx} className="text-xs text-muted-foreground capitalize flex items-start gap-1">
                                                                        <span className="h-1 w-1 mt-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                                                                        <span className="flex-1">{r.crop}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )
                                                    const targetCell = renderTargetGrid(firstRate.targets || [])
                                                    return renderEntryRows(firstRate, `group-${groupId}`, cropCell, targetCell)
                                                })}

                                                {/* Ungrouped rates - group by matching targets */}
                                                {(() => {
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
                                                    return targetOrder.map((targetKey, tgIdx) => {
                                                        const rates = targetGrouped.get(targetKey)!
                                                        if (rates.length === 1) {
                                                            const rate = rates[0]
                                                            const cropCell = (
                                                                <div>
                                                                    <div className="font-semibold capitalize text-sm text-foreground">{rate.crop}</div>
                                                                    {rate.category_name && (
                                                                        <div className="text-xs text-muted-foreground mt-0.5">{rate.category_name}</div>
                                                                    )}
                                                                </div>
                                                            )
                                                            const targetCell = renderTargetGrid(rate.targets || [])
                                                            return renderEntryRows(rate, `tg-${tgIdx}`, cropCell, targetCell)
                                                        }
                                                        return rates.map((rate: any, rateIdx: number) => {
                                                            const cropCell = (
                                                                <div>
                                                                    <div className="font-semibold capitalize text-sm text-foreground">{rate.crop}</div>
                                                                    {rate.category_name && (
                                                                        <div className="text-xs text-muted-foreground mt-0.5">{rate.category_name}</div>
                                                                    )}
                                                                </div>
                                                            )
                                                            const targetCell = rateIdx === 0 ? renderTargetGrid(rate.targets || []) : null
                                                            return renderEntryRows(rate, `tg-${tgIdx}-${rateIdx}`, cropCell, targetCell)
                                                        })
                                                    })
                                                })()}
                                            </>
                                        )
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Product Labels Section */}
                {(chemical.front_label?.img?.src || chemical.back_label?.img?.src) && (
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold mb-6">Product Labels</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Front Label */}
                            {chemical.front_label?.img?.src && (
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold">Front Label</h3>
                                    <div className="relative aspect-[3/4] bg-white rounded-lg border overflow-hidden">
                                        <Image
                                            src={chemical.front_label.img.src}
                                            alt={`${chemical.name} - Front Label`}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            className="object-contain p-4"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Back Label */}
                            {chemical.back_label?.img?.src && (
                                <div className="space-y-3">
                                    <h3 className="text-lg font-semibold">Back Label</h3>
                                    <div className="relative aspect-[3/4] bg-white rounded-lg border overflow-hidden">
                                        <Image
                                            src={chemical.back_label.img.src}
                                            alt={`${chemical.name} - Back Label`}
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
                                Always read and follow label directions. Wear appropriate personal protective equipment (PPE) when handling agrochemicals.
                                Store in original containers in a secure location away from children and animals. Dispose of containers properly according to local regulations.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
