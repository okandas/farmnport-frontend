import Image from "next/image"
import { Beaker, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { AdSenseInFeed } from "@/components/ads/AdSenseInFeed"
import { capitalizeFirstLetter, formatUnit } from "@/lib/utilities"
import { BaseURL } from "@/lib/schemas"
import { BuyNowButton } from "./BuyNowButton"

const fetchOptions: RequestInit = process.env.NODE_ENV === "production"
    ? { next: { revalidate: 3600 } } as RequestInit
    : { cache: "no-store" }

async function getProduct(slug: string) {
    try {
        const res = await fetch(`${BaseURL}/animalhealth/${slug}`, fetchOptions)
        if (!res.ok) return null
        const json = await res.json()
        return json?.data || null
    } catch {
        return null
    }
}

interface GuidePageProps {
    params: Promise<{
        category: string
        slug: string
    }>
}

const overviewDesc: Record<string, string> = {
    vaccines: "a vaccine designed to protect poultry and livestock against infectious diseases. It stimulates the immune system to build resistance when administered according to the recommended schedule.",
    antibiotics: "an antibiotic formulated for the treatment and prevention of bacterial infections in poultry and livestock. It targets harmful bacteria while supporting animal recovery when used as directed.",
    "nutrition-supplements": "a nutritional supplement formulated to support optimal health and productivity in poultry and livestock. It provides essential vitamins, minerals, and nutrients for growth and well-being.",
    "anti-protozoa": "an anti-protozoal product developed for the treatment and prevention of protozoal infections such as coccidiosis. It effectively manages parasitic protozoa in poultry and livestock.",
    "biosecurity-disinfectants": "a biosecurity disinfectant designed for cleaning and sanitizing poultry and livestock housing. It helps eliminate pathogens and maintain a healthy environment.",
}

export default async function AnimalHealthGuidePage({ params }: GuidePageProps) {
    const { category, slug } = await params
    const product = await getProduct(slug)

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
                        We couldn&apos;t find the animal health product guide you&apos;re looking for. It may have been removed or the link might be incorrect.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link href="/animal-health-guides/all">
                            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                                Browse All Guides
                            </button>
                        </Link>
                        <Link href="/animal-health-guides">
                            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2">
                                Go to Categories
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    const categorySlug = product?.animal_health_category?.slug || ""

    // Generate JSON-LD structured data
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'
    const url = `${baseUrl}/animal-health-guides/${category}/${slug}`
    const imageUrl = product.images?.[0]?.img?.src || `${baseUrl}/default-chemical.png`

    const description = product.animal_health_category?.name
        ? `${product.name} is a ${product.animal_health_category.name} for poultry and livestock health. View active ingredients, dosage rates, and withdrawal periods.`
        : `Professional animal health product guide for ${product.name}. Complete information on active ingredients, dosage rates, and withdrawal periods.`

    const usageInfo = product.dosage_rates?.length > 0
        ? `Dosage rates available for ${product.dosage_rates.map((r: any) => r.animal).join(', ')}`
        : undefined

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
        "usageInfo": usageInfo
    }

    // Pre-process dosage rates grouping for the table
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

    // Pre-process ungrouped target grouping
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
                <td className="p-3 align-top">
                    {entryIdx === 0 ? animalCell : null}
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
                    <div className="font-semibold text-rose-700 dark:text-rose-300 text-sm">{entry.withdrawal_period}</div>
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
        <div className="min-h-screen bg-background">
            {/* JSON-LD Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />

            {/* Breadcrumb */}
            <div className="border-b bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/animal-health-guides/all" className="hover:text-foreground">Guides</Link>
                        <span className="mx-2">/</span>
                        <Link href={`/animal-health-guides/${category}`} className="hover:text-foreground capitalize">{product.animal_health_category?.name || category}</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground capitalize">{product.name}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="grid lg:grid-cols-[450px,1fr] gap-12 mb-16">
                    {/* Left - Image */}
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
                                    <button
                                        key={idx}
                                        className="relative aspect-square bg-white rounded-lg border hover:border-primary transition-colors"
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
                                    </button>
                                ))}
                            </div>
                        )}

                        <BuyNowButton slug={slug} />
                    </div>

                    {/* Right - Product Info */}
                    <div className="space-y-6">
                        {/* Product Name */}
                        <h1 className="text-3xl lg:text-4xl font-bold capitalize leading-tight">
                            {product.name}
                        </h1>

                        {/* Category Badge */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {product.animal_health_category && (
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                    {product.animal_health_category.name}
                                </div>
                            )}
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-border" />

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

                        {/* Active Ingredients Section */}
                        <div>
                            <h2 className="text-lg font-semibold mb-3 text-foreground">
                                Active Ingredients
                            </h2>
                            {product.active_ingredients && product.active_ingredients.length > 0 ? (
                                <div className="space-y-2">
                                    {product.active_ingredients.map((ai: any, idx: number) => (
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
                            {product.dosage_rates && product.dosage_rates.length > 0 && (
                                <div className="rounded-xl border bg-card p-4">
                                    <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-3">
                                        Used On
                                    </h2>
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

                            {/* Target Diseases Section */}
                            <div className="rounded-xl border bg-card p-4">
                                <h2 className="text-sm font-semibold uppercase tracking-wide text-green-700 dark:text-green-400 mb-3">
                                    Target Diseases & Conditions
                                </h2>
                                {product.targets && product.targets.length > 0 ? (
                                    <ul className="space-y-1.5">
                                        {product.targets.map((target: any, idx: number) => (
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
                                    <p className="text-sm text-muted-foreground">No target disease information available.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dosage Rates & Application Guide Section */}
                {product.dosage_rates && product.dosage_rates.length > 0 && (
                    <div className="mb-12">
                        <h2 className="sticky top-16 z-10 text-2xl font-bold py-4 text-foreground bg-background">Dosage Rates & Application Guide</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-b-2 border-blue-200 dark:border-blue-800">
                                        <th className="text-left p-3 text-sm font-semibold text-blue-900 dark:text-blue-100">Animal</th>
                                        <th className="text-left p-3 text-sm font-semibold text-blue-900 dark:text-blue-100">Target</th>
                                        <th className="text-left p-3 text-sm font-semibold text-blue-900 dark:text-blue-100 min-w-[200px]">Dosage</th>
                                        <th className="text-left p-3 text-sm font-semibold text-orange-700 dark:text-orange-300">Max Applications</th>
                                        <th className="text-left p-3 text-sm font-semibold text-teal-700 dark:text-teal-300">Application Interval</th>
                                        <th className="text-left p-3 text-sm font-semibold text-rose-700 dark:text-rose-300">Withdrawal Period</th>
                                        <th className="text-left p-3 text-sm font-semibold text-blue-900 dark:text-blue-100">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Grouped rates */}
                                    {Array.from(grouped.entries()).map(([groupId, rates]) => {
                                        const firstRate = rates[0]
                                        const animalCell = (
                                            <div>
                                                <div className="font-semibold text-sm text-blue-700 dark:text-blue-300">
                                                    {firstRate.animal_group}
                                                </div>
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
                                        const targetCell = renderTargetGrid(firstRate.targets || [])
                                        return renderEntryRows(firstRate, `group-${groupId}`, animalCell, targetCell)
                                    })}

                                    {/* Ungrouped rates */}
                                    {targetOrder.map((targetKey, tgIdx) => {
                                        const rates = targetGrouped.get(targetKey)!
                                        if (rates.length === 1) {
                                            const rate = rates[0]
                                            const animalCell = (
                                                <div>
                                                    <div className="font-semibold capitalize text-sm text-foreground">{rate.animal}</div>
                                                </div>
                                            )
                                            const targetCell = renderTargetGrid(rate.targets || [])
                                            return renderEntryRows(rate, `tg-${tgIdx}`, animalCell, targetCell)
                                        }
                                        return rates.map((rate: any, rateIdx: number) => {
                                            const animalCell = (
                                                <div>
                                                    <div className="font-semibold capitalize text-sm text-foreground">{rate.animal}</div>
                                                </div>
                                            )
                                            const targetCell = rateIdx === 0 ? renderTargetGrid(rate.targets || []) : null
                                            return renderEntryRows(rate, `tg-${tgIdx}-${rateIdx}`, animalCell, targetCell)
                                        })
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Product Labels Section */}
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
                                Always read and follow label directions. Consult a veterinarian before administering animal health products.
                                Observe withdrawal periods before slaughter or sale of animal products. Store in original containers in a cool, dry place away from children.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
