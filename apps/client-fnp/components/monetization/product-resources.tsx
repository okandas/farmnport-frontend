"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { sendGTMEvent } from "@next/third-parties/google"
import { Layers } from "lucide-react"
import { queryPublishedFeedingPrograms } from "@/lib/query"
import { capitalizeFirstLetter } from "@/lib/utilities"

interface ProductResourcesProps {
    product: string
}

// Prefix-based matching for animal produce slugs (e.g. "chickens-broilers", "chicken-meat")
const ANIMAL_PREFIXES = [
    "chicken", "cattle", "beef", "pork", "pig",
    "goat", "sheep", "lamb", "mutton",
    "duck", "turkey", "rabbit", "ostrich",
    "tilapia", "trout", "catfish"
]

function isAnimalProduce(slug: string): boolean {
    const lower = slug.toLowerCase()
    return ANIMAL_PREFIXES.some(p => lower === p || lower.startsWith(p))
}

function normalizeAnimal(slug: string): string {
    const lower = slug.toLowerCase()
    if (lower.startsWith("chicken")) return "chicken"
    if (lower.startsWith("cattle") || lower.startsWith("beef")) return "cattle"
    if (lower.startsWith("pork") || lower.startsWith("pig")) return "pigs"
    if (lower.startsWith("sheep") || lower.startsWith("lamb") || lower.startsWith("mutton")) return "sheep"
    if (lower.startsWith("goat")) return "goats"
    if (lower.startsWith("duck")) return "ducks"
    if (lower.startsWith("turkey")) return "turkeys"
    if (lower.startsWith("rabbit")) return "rabbits"
    if (lower.startsWith("ostrich")) return "ostriches"
    return lower
}

export function ProductResources({ product }: ProductResourcesProps) {
    const lower = product.toLowerCase()

    const isAnimal = isAnimalProduce(lower)

    const { data, isLoading } = useQuery({
        queryKey: ["feeding-programs-cross-sell"],
        queryFn: () => queryPublishedFeedingPrograms(),
        enabled: isAnimal,
        refetchOnWindowFocus: false,
    })

    if (!isAnimal) return null

    const allPrograms = data?.data?.data || []
    const animal = normalizeAnimal(lower)
    const matchingPrograms = allPrograms.filter(
        (p: any) => p.farm_produce_name?.toLowerCase() === animal
    ).slice(0, 3)

    const displayName = capitalizeFirstLetter(product)

    // Static resource cards with filtered URLs
    const staticCards = [
        {
            title: `${displayName} Vaccines`,
            description: "Vaccination schedules & guides",
            href: `/animal-health-guides/vaccines?used_on=${animal}`,
            event: `CrossSellVaccines_${lower}`,
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
            ),
        },
        {
            title: `${displayName} Nutrition`,
            description: "Supplements & nutrition guides",
            href: `/animal-health-guides/nutrition-supplements?used_on=${animal}`,
            event: `CrossSellNutrition_${lower}`,
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
            ),
        },
    ]

    const hasContent = matchingPrograms.length > 0 || staticCards.length > 0

    if (!hasContent && !isLoading) return null

    return (
        <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                Resources for {displayName} Farming
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {matchingPrograms.map((program: any) => (
                    <Link
                        key={program.id}
                        href={`/feeding-programs/${program.slug}`}
                        className="flex items-center gap-3 rounded-lg border bg-card p-3 transition hover:border-primary/50 hover:shadow-sm group"
                        onClick={() => sendGTMEvent({ event: "click", value: `CrossSellFeedProgram_${program.slug}` })}
                    >
                        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors">
                            <Layers className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{capitalizeFirstLetter(program.name)}</p>
                            <p className="text-xs text-muted-foreground">{program.stages?.length || 0} stage feeding program</p>
                        </div>
                    </Link>
                ))}
                {staticCards.map((card) => (
                    <Link
                        key={card.title}
                        href={card.href}
                        className="flex items-center gap-3 rounded-lg border bg-card p-3 transition hover:border-primary/50 hover:shadow-sm group"
                        onClick={() => sendGTMEvent({ event: "click", value: card.event })}
                    >
                        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors">
                            {card.icon}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{card.title}</p>
                            <p className="text-xs text-muted-foreground">{card.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}
