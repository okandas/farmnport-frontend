"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
    Sprout, AlertTriangle, ChevronRight, Droplets,
    Bug, Leaf, TrendingUp, Beaker, Shield, X
} from "lucide-react"
import { capitalizeFirstLetter } from "@/lib/utilities"
import { AdSenseInFeed } from "@/components/ads/AdSenseInFeed"

// Unified stage styling -- clean, minimal
const STAGE_STYLE = {
    dot: "bg-green-600 dark:bg-green-500",
    bg: "bg-muted/40",
    text: "text-foreground",
    border: "border-border",
}

const PURPOSE_COLORS: Record<string, { bg: string; text: string; icon: any }> = {
    "Weed Control": { bg: "bg-green-100 dark:bg-green-900/40", text: "text-green-700 dark:text-green-300", icon: Leaf },
    "Insect Control": { bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-700 dark:text-red-300", icon: Bug },
    "Disease Prevention": { bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-700 dark:text-purple-300", icon: Shield },
    "Disease Control": { bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-700 dark:text-purple-300", icon: Shield },
    "Growth Regulation": { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300", icon: TrendingUp },
    "Nutrient Management": { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-300", icon: Droplets },
    "Soil Treatment": { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-700 dark:text-orange-300", icon: Beaker },
    "Seed Treatment": { bg: "bg-teal-100 dark:bg-teal-900/40", text: "text-teal-700 dark:text-teal-300", icon: Sprout },
}

function getPurposeStyle(purpose: string) {
    return PURPOSE_COLORS[purpose] || { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300", icon: Beaker }
}

interface SprayProgramDetailClientProps {
    program: any
    slug: string
}

export function SprayProgramDetailClient({ program, slug }: SprayProgramDetailClientProps) {
    const [activeStage, setActiveStage] = useState(0)
    const [quickViewProduct, setQuickViewProduct] = useState<any>(null)
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
    const stageRefs = useRef<(HTMLDivElement | null)[]>([])
    const navRef = useRef<HTMLDivElement>(null)

    const stages = program.stages || []

    // IntersectionObserver for sticky nav highlighting
    useEffect(() => {
        if (!stages.length) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = stageRefs.current.indexOf(entry.target as HTMLDivElement)
                        if (index !== -1) {
                            setActiveStage(index)
                        }
                    }
                })
            },
            { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
        )

        stageRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref)
        })

        return () => observer.disconnect()
    }, [stages])

    const scrollToStage = (index: number) => {
        const el = stageRefs.current[index]
        if (el) {
            const offset = 140
            const y = el.getBoundingClientRect().top + window.scrollY - offset
            window.scrollTo({ top: y, behavior: "smooth" })
        }
    }

    // Extract unique brands from all recommendations
    const allBrands = new Set<string>()
    stages.forEach((stage: any) => {
        (stage.recommendations || []).forEach((rec: any) => {
            const brand = rec.agrochemical?.brand?.name
            if (brand) allBrands.add(brand)
        })
    })
    const brands = Array.from(allBrands).sort()
    const hasBrands = brands.length > 0

    // Filter helper
    const matchesBrand = (rec: any) => {
        if (!selectedBrand) return true
        return rec.agrochemical?.brand?.name === selectedBrand
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Breadcrumb */}
            <div className="border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/spray-programs" className="hover:text-foreground">Spray Programs</Link>
                        <span className="mx-2">/</span>
                        <span className="text-foreground">{capitalizeFirstLetter(program.name)}</span>
                    </nav>
                </div>
            </div>

            {/* Hero Header */}
            <section className="relative overflow-hidden">
                {program.cover_image?.img?.src ? (
                    <div className="relative h-56 sm:h-72 lg:h-80">
                        <Image
                            src={program.cover_image.img.src}
                            alt={program.name}
                            fill
                            sizes="100vw"
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                            <div className="flex items-center gap-3 mb-3">
                                {program.farm_produce_name && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100/90 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 backdrop-blur-sm">
                                        {capitalizeFirstLetter(program.farm_produce_name)}
                                    </span>
                                )}
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-foreground dark:bg-gray-900/60 dark:text-gray-200 backdrop-blur-sm">
                                    {stages.length} Growth {stages.length === 1 ? "Stage" : "Stages"}
                                </span>
                                {program.crop_group_name && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100/90 text-green-800 dark:bg-green-900/60 dark:text-green-300 backdrop-blur-sm">
                                        {capitalizeFirstLetter(program.crop_group_name)}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
                                {capitalizeFirstLetter(program.name)}
                            </h1>
                            {program.scientific_name && (
                                <p className="mt-1 text-base sm:text-lg italic text-muted-foreground/80">
                                    {program.scientific_name}
                                </p>
                            )}
                            {program.description && (
                                <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl">
                                    {program.description}
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="relative py-12 lg:py-16">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center gap-3 mb-3">
                                {program.farm_produce_name && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                        {capitalizeFirstLetter(program.farm_produce_name)}
                                    </span>
                                )}
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                    {stages.length} Growth {stages.length === 1 ? "Stage" : "Stages"}
                                </span>
                                {program.crop_group_name && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                        {capitalizeFirstLetter(program.crop_group_name)}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                                {capitalizeFirstLetter(program.name)}
                            </h1>
                            {program.scientific_name && (
                                <p className="mt-1 text-base sm:text-lg italic text-muted-foreground/80">
                                    {program.scientific_name}
                                </p>
                            )}
                            {program.description && (
                                <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl">
                                    {program.description}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </section>

            {/* Sticky Stage Navigator */}
            {stages.length > 0 && (
                <div ref={navRef} className="sticky top-16 z-20 bg-background/95 backdrop-blur-md border-b shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-wrap gap-1 py-3">
                            {/* Overview tab */}
                            <button
                                onClick={() => scrollToStage(0)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                    activeStage === 0
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${activeStage === 0 ? "bg-primary-foreground" : STAGE_STYLE.dot}`} />
                                    Overview
                                </span>
                            </button>
                            {/* Stage tabs */}
                            {stages.map((stage: any, index: number) => {
                                const tabIndex = index + 1
                                const isActive = activeStage === tabIndex
                                return (
                                    <button
                                        key={index}
                                        onClick={() => scrollToStage(tabIndex)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${isActive ? "bg-primary-foreground" : STAGE_STYLE.dot}`} />
                                            {capitalizeFirstLetter(stage.name)}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Program Chart */}
            {stages.length > 0 && (() => {
                // Build purpose -> stage -> recommendations map
                const purposeMap = new Map<string, Map<number, any[]>>()
                stages.forEach((stage: any, stageIdx: number) => {
                    (stage.recommendations || []).forEach((rec: any) => {
                        const purpose = rec.purpose || "Other"
                        if (!purposeMap.has(purpose)) purposeMap.set(purpose, new Map())
                        const stageMap = purposeMap.get(purpose)!
                        if (!stageMap.has(stageIdx)) stageMap.set(stageIdx, [])
                        stageMap.get(stageIdx)!.push(rec)
                    })
                })
                const purposes = Array.from(purposeMap.keys())

                if (purposes.length === 0) return null

                return (
                    <div
                        ref={(el) => { stageRefs.current[0] = el }}
                        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-foreground">Program Overview</h2>
                            {hasBrands && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-muted-foreground">Brand:</span>
                                    <button
                                        onClick={() => setSelectedBrand(null)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                            !selectedBrand
                                                ? "bg-foreground text-background"
                                                : "bg-muted text-muted-foreground hover:text-foreground"
                                        }`}
                                    >
                                        All
                                    </button>
                                    {brands.map((brand) => (
                                        <button
                                            key={brand}
                                            onClick={() => setSelectedBrand(brand)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                                selectedBrand === brand
                                                    ? "bg-foreground text-background"
                                                    : "bg-muted text-muted-foreground hover:text-foreground"
                                            }`}
                                        >
                                            {capitalizeFirstLetter(brand)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="rounded-xl border border-border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse min-w-[640px]">
                                    <thead>
                                        <tr className="bg-muted/60">
                                            <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide p-3 w-36 border-r border-border sticky left-0 bg-muted/60 z-10">
                                                Category
                                            </th>
                                            {stages.map((stage: any, idx: number) => (
                                                <th key={idx} className="text-center p-3 border-r border-border last:border-r-0 min-w-[140px]">
                                                    <div className="text-xs font-semibold text-foreground">{capitalizeFirstLetter(stage.name)}</div>
                                                    {stage.timing_description && (
                                                        <div className="text-[10px] text-muted-foreground font-normal mt-0.5">{stage.timing_description}</div>
                                                    )}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {purposes.map((purpose) => {
                                            const stageMap = purposeMap.get(purpose)!
                                            const style = getPurposeStyle(purpose)
                                            const Icon = style.icon
                                            return (
                                                <tr key={purpose} className="hover:bg-muted/20 transition-colors">
                                                    <td className="p-3 border-r border-border sticky left-0 bg-background z-10">
                                                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium ${style.bg} ${style.text}`}>
                                                            <Icon className="h-3 w-3" />
                                                            {purpose}
                                                        </div>
                                                    </td>
                                                    {stages.map((_: any, stageIdx: number) => {
                                                        const recs = (stageMap.get(stageIdx) || []).filter(matchesBrand)
                                                        return (
                                                            <td key={stageIdx} className="p-2 border-r border-border last:border-r-0 align-top">
                                                                {recs.length > 0 ? (
                                                                    <div className="space-y-1.5">
                                                                        {recs.map((rec: any, i: number) => {
                                                                            const brandName = rec.agrochemical?.brand?.name
                                                                            return (
                                                                                <button
                                                                                    key={i}
                                                                                    onClick={() => rec.agrochemical && setQuickViewProduct({ ...rec, agrochemical: rec.agrochemical })}
                                                                                    className={`block w-full text-left p-1.5 rounded ${style.bg} cursor-pointer hover:ring-1 hover:ring-current transition-all`}
                                                                                >
                                                                                    <div className={`text-[11px] font-medium ${style.text} leading-tight`}>
                                                                                        {capitalizeFirstLetter(rec.agrochemical_name)}
                                                                                    </div>
                                                                                    {brandName && hasBrands && (
                                                                                        <div className="text-[9px] text-muted-foreground mt-0.5">{capitalizeFirstLetter(brandName)}</div>
                                                                                    )}
                                                                                    {rec.dosage?.value && (
                                                                                        <div className="text-[10px] text-muted-foreground mt-0.5">
                                                                                            {rec.dosage.value} {rec.dosage.unit}
                                                                                        </div>
                                                                                    )}
                                                                                </button>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-center text-muted-foreground/30 text-xs py-2">—</div>
                                                                )}
                                                            </td>
                                                        )
                                                    })}
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )
            })()}

            {/* AdSense after overview */}
            {stages.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
                    <AdSenseInFeed />
                </div>
            )}

            {/* Stage Sections */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
                {stages.map((stage: any, stageIndex: number) => {
                    const recommendations = stage.recommendations || []

                    return (
                        <div
                            key={stageIndex}
                            ref={(el) => { stageRefs.current[stageIndex + 1] = el }}
                            className="rounded-xl border border-border overflow-hidden"
                        >
                            {/* Stage Header */}
                            <div className="bg-muted/40 px-6 py-5">
                                <div className="flex items-start justify-between flex-wrap gap-3">
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                                            {capitalizeFirstLetter(stage.name)}
                                        </h2>
                                        {stage.description && (
                                            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                                                {stage.description}
                                            </p>
                                        )}
                                    </div>
                                    {stage.timing_description && (
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border">
                                            {stage.timing_description}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Recommendations */}
                            {recommendations.filter(matchesBrand).length > 0 ? (
                                <div className="divide-y divide-border">
                                    {recommendations.filter(matchesBrand).map((rec: any, recIndex: number) => {
                                        const purposeStyle = getPurposeStyle(rec.purpose)
                                        const PurposeIcon = purposeStyle.icon
                                        const agrochemical = rec.agrochemical
                                        const brandName = agrochemical?.brand?.name
                                        const guideHref = agrochemical?.agrochemical_category?.slug && rec.agrochemical_slug
                                            ? `/agrochemical-guides/${agrochemical.agrochemical_category.slug}/${rec.agrochemical_slug}?from=${slug}`
                                            : null

                                        return (
                                            <div key={recIndex} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/30 transition-colors">
                                                {/* Thumbnail */}
                                                <button
                                                    onClick={() => agrochemical && setQuickViewProduct({ ...rec, agrochemical })}
                                                    className="relative w-10 h-10 rounded-md bg-white dark:bg-gray-900 border overflow-hidden flex-shrink-0 cursor-pointer"
                                                >
                                                    {agrochemical?.images?.[0]?.img?.src ? (
                                                        <Image
                                                            src={agrochemical.images[0].img.src}
                                                            alt={rec.agrochemical_name}
                                                            fill
                                                            sizes="40px"
                                                            className="object-contain p-0.5"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <Beaker className="w-4 h-4 text-muted-foreground/40" />
                                                        </div>
                                                    )}
                                                </button>

                                                {/* Name + Brand + Purpose */}
                                                <div className="flex-1 min-w-0">
                                                    <button
                                                        onClick={() => agrochemical && setQuickViewProduct({ ...rec, agrochemical })}
                                                        className="text-sm font-medium text-foreground hover:text-primary transition-colors text-left block w-full cursor-pointer"
                                                    >
                                                        {capitalizeFirstLetter(rec.agrochemical_name)}
                                                        {brandName && hasBrands && (
                                                            <span className="text-muted-foreground font-normal"> — {capitalizeFirstLetter(brandName)}</span>
                                                        )}
                                                    </button>
                                                    <div className={`inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium ${purposeStyle.bg} ${purposeStyle.text}`}>
                                                        <PurposeIcon className="h-2.5 w-2.5" />
                                                        {rec.purpose}
                                                    </div>
                                                </div>

                                                {/* Dosage */}
                                                {rec.dosage && (rec.dosage.value || rec.dosage.unit) && (
                                                    <div className="hidden sm:block text-right flex-shrink-0">
                                                        <div className="text-sm font-medium text-foreground">
                                                            {rec.dosage.value} {rec.dosage.unit}
                                                        </div>
                                                        {rec.dosage.per && (
                                                            <div className="text-[11px] text-muted-foreground">per {rec.dosage.per}</div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* View Guide */}
                                                {guideHref && (
                                                    <Link
                                                        href={guideHref}
                                                        className="flex-shrink-0 text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                                                    >
                                                        View Guide
                                                        <ChevronRight className="h-3 w-3" />
                                                    </Link>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="p-6 text-sm text-muted-foreground">
                                    {selectedBrand ? `No ${capitalizeFirstLetter(selectedBrand)} recommendations for this stage.` : "No recommendations for this stage yet."}
                                </div>
                            )}
                        </div>
                    )
                })}

                {/* Safety Warning */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold mb-2 text-yellow-900 dark:text-yellow-100">Safety Information</h3>
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                Always read and follow label directions. Wear appropriate personal protective equipment (PPE) when handling agrochemicals.
                                Store in original containers in a secure location away from children and animals. Dispose of containers properly according to local regulations.
                                Consult your local extension officer for region-specific recommendations.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Quick-View Dialog */}
            {quickViewProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setQuickViewProduct(null)}
                    />

                    {/* Dialog */}
                    <div className="relative bg-background rounded-xl border shadow-2xl max-w-2xl w-full">
                        {/* Close Button */}
                        <button
                            onClick={() => setQuickViewProduct(null)}
                            className="absolute right-3 top-3 z-10 p-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="flex gap-5 p-5">
                            {/* Product Image */}
                            <div className="relative w-32 h-32 sm:w-40 sm:h-40 bg-white dark:bg-gray-900 rounded-lg border overflow-hidden flex-shrink-0">
                                {quickViewProduct.agrochemical?.images?.[0]?.img?.src ? (
                                    <Image
                                        src={quickViewProduct.agrochemical.images[0].img.src}
                                        alt={quickViewProduct.agrochemical_name}
                                        fill
                                        sizes="160px"
                                        className="object-contain p-3"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Beaker className="w-12 h-12 text-muted-foreground/30" />
                                    </div>
                                )}
                            </div>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0 space-y-2.5">
                                <h3 className="text-lg font-bold leading-tight pr-8">
                                    {capitalizeFirstLetter(quickViewProduct.agrochemical_name)}
                                </h3>

                                <div className="flex items-center gap-2 flex-wrap">
                                    {/* Brand */}
                                    {quickViewProduct.agrochemical?.brand?.name && (
                                        <span className="text-xs text-muted-foreground">
                                            {capitalizeFirstLetter(quickViewProduct.agrochemical.brand.name)}
                                        </span>
                                    )}
                                    {/* Category */}
                                    {quickViewProduct.agrochemical?.agrochemical_category?.name && (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted text-muted-foreground">
                                            {quickViewProduct.agrochemical.agrochemical_category.name}
                                        </span>
                                    )}
                                </div>

                                {/* Dosage */}
                                {quickViewProduct.dosage && (quickViewProduct.dosage.value || quickViewProduct.dosage.unit) && (
                                    <div className="text-sm">
                                        <span className="font-semibold">{quickViewProduct.dosage.value} {quickViewProduct.dosage.unit}</span>
                                        {quickViewProduct.dosage.per && (
                                            <span className="text-muted-foreground"> per {quickViewProduct.dosage.per}</span>
                                        )}
                                    </div>
                                )}

                                {/* Active Ingredients - inline */}
                                {quickViewProduct.agrochemical?.active_ingredients?.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {quickViewProduct.agrochemical.active_ingredients.map((ai: any, idx: number) => (
                                            <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-foreground capitalize">
                                                {ai.name} {ai.dosage_value}{ai.dosage_unit}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Targets - inline */}
                                {quickViewProduct.agrochemical?.targets?.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {quickViewProduct.agrochemical.targets.map((t: any, idx: number) => (
                                            <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 capitalize">
                                                {t.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CTA */}
                        {quickViewProduct.agrochemical?.agrochemical_category?.slug && quickViewProduct.agrochemical_slug && (
                            <div className="px-5 pb-5">
                                <Link
                                    href={`/agrochemical-guides/${quickViewProduct.agrochemical.agrochemical_category.slug}/${quickViewProduct.agrochemical_slug}?from=${slug}`}
                                    className="flex items-center justify-center gap-2 w-full py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                    onClick={() => setQuickViewProduct(null)}
                                >
                                    View Full Guide
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
