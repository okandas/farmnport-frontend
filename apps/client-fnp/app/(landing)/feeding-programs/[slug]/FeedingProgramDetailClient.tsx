"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
    Egg, ChevronRight, TrendingUp, Shield, Heart,
    ArrowRight, Sprout, Flag, X, AlertTriangle
} from "lucide-react"
import { capitalizeFirstLetter } from "@/lib/utilities"
import { AdSenseInFeed } from "@/components/ads/AdSenseInFeed"

const STAGE_STYLE = {
    dot: "bg-amber-600 dark:bg-amber-500",
    bg: "bg-muted/40",
    text: "text-foreground",
    border: "border-border",
}

const PURPOSE_COLORS: Record<string, { bg: string; text: string; icon: any }> = {
    "Growth": { bg: "bg-green-100 dark:bg-green-900/40", text: "text-green-700 dark:text-green-300", icon: TrendingUp },
    "Maintenance": { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-300", icon: Shield },
    "Egg Production": { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-300", icon: Egg },
    "Weight Gain": { bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-700 dark:text-red-300", icon: TrendingUp },
    "Breeding": { bg: "bg-purple-100 dark:bg-purple-900/40", text: "text-purple-700 dark:text-purple-300", icon: Heart },
    "Transition": { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-700 dark:text-orange-300", icon: ArrowRight },
    "Starter": { bg: "bg-teal-100 dark:bg-teal-900/40", text: "text-teal-700 dark:text-teal-300", icon: Sprout },
    "Finisher": { bg: "bg-indigo-100 dark:bg-indigo-900/40", text: "text-indigo-700 dark:text-indigo-300", icon: Flag },
}

function getPurposeStyle(purpose: string) {
    return PURPOSE_COLORS[purpose] || { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300", icon: Egg }
}

interface FeedingProgramDetailClientProps {
    program: any
    slug: string
}

export function FeedingProgramDetailClient({ program, slug }: FeedingProgramDetailClientProps) {
    const [activeStage, setActiveStage] = useState(0)
    const [quickViewRec, setQuickViewRec] = useState<any>(null)
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
    const stageRefs = useRef<(HTMLDivElement | null)[]>([])
    const navRef = useRef<HTMLDivElement>(null)

    // Extract unique brands from all recommendations
    const brands = useMemo(() => {
        if (!program?.stages) return []
        const brandMap = new Map<string, string>()
        program.stages.forEach((stage: any) => {
            (stage.recommendations || []).forEach((rec: any) => {
                const brandName = rec.feed_product?.brand?.name
                if (brandName && !brandMap.has(brandName)) {
                    brandMap.set(brandName, brandName)
                }
            })
        })
        return Array.from(brandMap.values()).sort()
    }, [program?.stages])

    // Filter stages' recommendations by selected brand
    const filteredStages = useMemo(() => {
        if (!program?.stages) return []
        if (!selectedBrand) return program.stages
        return program.stages.map((stage: any) => ({
            ...stage,
            recommendations: (stage.recommendations || []).filter(
                (rec: any) => rec.feed_product?.brand?.name === selectedBrand
            ),
        }))
    }, [program?.stages, selectedBrand])

    useEffect(() => {
        if (!program?.stages?.length) return

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = stageRefs.current.indexOf(entry.target as HTMLDivElement)
                        if (index !== -1) setActiveStage(index)
                    }
                })
            },
            { rootMargin: "-120px 0px -60% 0px", threshold: 0 }
        )

        stageRefs.current.forEach((ref) => {
            if (ref) observer.observe(ref)
        })

        return () => observer.disconnect()
    }, [program?.stages])

    const scrollToStage = (index: number) => {
        const el = stageRefs.current[index]
        if (el) {
            const offset = 140
            const y = el.getBoundingClientRect().top + window.scrollY - offset
            window.scrollTo({ top: y, behavior: "smooth" })
        }
    }

    const stages = filteredStages
    const allStages = program.stages || []

    return (
        <div className="min-h-screen bg-background">
            {/* Breadcrumb */}
            <div className="border-b bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <nav className="flex text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/feeding-programs" className="hover:text-foreground">Feeding Programs</Link>
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
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100/90 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 backdrop-blur-sm">
                                        <Egg className="h-3 w-3" />
                                        {capitalizeFirstLetter(program.farm_produce_name)}
                                    </span>
                                )}
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-foreground dark:bg-gray-900/60 dark:text-gray-200 backdrop-blur-sm">
                                    {allStages.length} Feeding {allStages.length === 1 ? "Stage" : "Stages"}
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
                                {capitalizeFirstLetter(program.name)}
                            </h1>
                            {program.description && (
                                <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl">
                                    {program.description}
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/20 py-12 lg:py-16">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex items-center gap-3 mb-3">
                                {program.farm_produce_name && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                        <Egg className="h-3 w-3" />
                                        {capitalizeFirstLetter(program.farm_produce_name)}
                                    </span>
                                )}
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                                    {allStages.length} Feeding {allStages.length === 1 ? "Stage" : "Stages"}
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
                                {capitalizeFirstLetter(program.name)}
                            </h1>
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
            {allStages.length > 0 && (
                <div ref={navRef} className="sticky top-16 z-20 bg-background/95 backdrop-blur-md border-b shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
                            <button
                                onClick={() => scrollToStage(0)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
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
                            {allStages.map((stage: any, index: number) => {
                                const tabIndex = index + 1
                                const isActive = activeStage === tabIndex
                                return (
                                    <button
                                        key={index}
                                        onClick={() => scrollToStage(tabIndex)}
                                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
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

            {/* Program Overview Chart */}
            {stages.length > 0 && (() => {
                const hasBrands = brands.length > 1

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

                if (purposes.length === 0 && !hasBrands) return null

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
                                    {brands.map((brand: string) => (
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
                                                Purpose
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
                                                        const recs = stageMap.get(stageIdx) || []
                                                        return (
                                                            <td key={stageIdx} className="p-2 border-r border-border last:border-r-0 align-top">
                                                                {recs.length > 0 ? (
                                                                    <div className="space-y-1.5">
                                                                        {recs.map((rec: any, i: number) => (
                                                                            <button
                                                                                key={i}
                                                                                onClick={() => setQuickViewRec(rec)}
                                                                                className={`block w-full text-left p-2 rounded ${style.bg} cursor-pointer hover:ring-1 hover:ring-current transition-all`}
                                                                            >
                                                                                <div className={`text-xs font-medium ${style.text} leading-tight`}>
                                                                                    {capitalizeFirstLetter(rec.feed_product_name)}
                                                                                </div>
                                                                                {rec.feed_product?.brand?.name && hasBrands && (
                                                                                    <div className="text-[10px] text-muted-foreground mt-0.5">{capitalizeFirstLetter(rec.feed_product.brand.name)}</div>
                                                                                )}
                                                                            </button>
                                                                        ))}
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

            {/* AdSense */}
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

                            {recommendations.length > 0 ? (
                                <div className="divide-y divide-border">
                                    {recommendations.map((rec: any, recIndex: number) => {
                                        const purposeStyle = getPurposeStyle(rec.purpose)
                                        const PurposeIcon = purposeStyle.icon

                                        return (
                                            <div key={recIndex} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/30 transition-colors">
                                                <div className="flex-1 min-w-0">
                                                    <button
                                                        onClick={() => setQuickViewRec(rec)}
                                                        className="text-sm font-medium text-foreground hover:text-primary transition-colors text-left truncate block w-full cursor-pointer"
                                                    >
                                                        {capitalizeFirstLetter(rec.feed_product_name)}
                                                    </button>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {rec.feed_product?.brand?.name && (
                                                            <span className="text-xs text-muted-foreground">{rec.feed_product.brand.name}</span>
                                                        )}
                                                        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${purposeStyle.bg} ${purposeStyle.text}`}>
                                                            <PurposeIcon className="h-2.5 w-2.5" />
                                                            {rec.purpose}
                                                        </div>
                                                    </div>
                                                </div>

                                                {rec.feed_product_slug && (
                                                    <Link
                                                        href={`/feeds/${rec.feed_product_slug}?ref=${slug}`}
                                                        className="flex-shrink-0 text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                                                    >
                                                        View Product
                                                        <ChevronRight className="h-3 w-3" />
                                                    </Link>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="p-6 text-sm text-muted-foreground">
                                    {selectedBrand
                                        ? `No ${selectedBrand} recommendations for this stage.`
                                        : "No feed recommendations for this stage yet."}
                                </div>
                            )}
                        </div>
                    )
                })}

                {/* Disclaimer */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold mb-2 text-yellow-900 dark:text-yellow-100">Important Notice</h3>
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                Always follow the manufacturer&apos;s feeding guidelines and recommended quantities. Feeding requirements may vary based on breed, climate, and individual animal condition. Consult a veterinarian or animal nutritionist for advice specific to your livestock operation.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick-View Dialog */}
            {quickViewRec && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setQuickViewRec(null)}
                    />
                    <div className="relative bg-background rounded-xl border shadow-2xl max-w-md w-full">
                        <button
                            onClick={() => setQuickViewRec(null)}
                            className="absolute right-3 top-3 z-10 p-1.5 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>

                        <div className="p-5 space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold leading-tight pr-8">
                                        {capitalizeFirstLetter(quickViewRec.feed_product_name)}
                                    </h3>
                                    {quickViewRec.feed_product?.show_price && quickViewRec.feed_product?.sale_price > 0 && (
                                        <div className="mt-2">
                                            <span className="text-lg font-bold text-foreground">${quickViewRec.feed_product.sale_price.toFixed(2)}</span>
                                            {quickViewRec.feed_product.was_price > quickViewRec.feed_product.sale_price && (
                                                <span className="text-sm text-muted-foreground line-through ml-2">${quickViewRec.feed_product.was_price.toFixed(2)}</span>
                                            )}
                                        </div>
                                    )}
                                    {quickViewRec.purpose && (() => {
                                        const style = getPurposeStyle(quickViewRec.purpose)
                                        const Icon = style.icon
                                        return (
                                            <div className={`inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded text-[11px] font-medium ${style.bg} ${style.text}`}>
                                                <Icon className="h-3 w-3" />
                                                {quickViewRec.purpose}
                                            </div>
                                        )
                                    })()}
                                </div>
                            </div>

                            {quickViewRec.notes && (
                                <div className="bg-muted/30 rounded-lg p-3 border">
                                    <p className="text-sm text-foreground">{quickViewRec.notes}</p>
                                </div>
                            )}
                        </div>

                        {quickViewRec.feed_product_slug && (
                            <div className="px-5 pb-5">
                                <Link
                                    href={`/feeds/${quickViewRec.feed_product_slug}?ref=${slug}`}
                                    className="flex items-center justify-center gap-2 w-full py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                    onClick={() => setQuickViewRec(null)}
                                >
                                    View Full Product
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
