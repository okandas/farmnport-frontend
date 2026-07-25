"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const subCategories: Record<string, { label: string; slug: string }[]> = {
    "/agrochemical-guides": [
        { label: "Acaricides", slug: "acaricides" },
        { label: "Fungicides", slug: "fungicides" },
        { label: "Herbicides", slug: "herbicides" },
        { label: "Insecticides", slug: "insecticides" },
        { label: "Foliar Feeds", slug: "foliar-feeds" },
        { label: "Seed Treatments", slug: "seed-treatments" },
        { label: "Fertilizers", slug: "fertilizers" },
        { label: "Nematicides", slug: "nematicides" },
    ],
    "/animal-health-guides": [
        { label: "Antibiotics", slug: "antibiotics" },
        { label: "Vaccines", slug: "vaccines" },
        { label: "Tick & Flea Control", slug: "tick-flea-control" },
        { label: "Worm & Fluke Control", slug: "worm-fluke-control" },
        { label: "Nutrition & Supplements", slug: "nutrition-supplements" },
        { label: "Wound Remedies", slug: "wound-remedies" },
        { label: "Fly Control", slug: "fly-control" },
        { label: "Biosecurity & Disinfectants", slug: "biosecurity-disinfectants" },
    ],
    "/plant-nutrition-guides": [
        { label: "Fertilizers", slug: "fertilizers" },
        { label: "Foliar Feeds", slug: "foliar-feeds" },
        { label: "Biostimulants", slug: "biostimulants" },
        { label: "Plant Growth Regulators", slug: "plant-growth-regulators" },
    ],
}

const guides = [
    { label: "Agrochemicals", href: "/agrochemical-guides" },
    { label: "Plant Nutrition", href: "/plant-nutrition-guides" },
    { label: "Animal Health", href: "/animal-health-guides" },
    { label: "Animal Nutrition", href: "/feed-guides" },
    { label: "Seeds", href: "/seed-guides" },
]

export function GuidesSidebarNav() {
    const pathname = usePathname()

    return (
        <div className="mb-6 lg:mb-6">
            <nav className="hidden lg:flex flex-col gap-0.5">
                {guides.map(({ label, href }) => {
                    const isActive = pathname.startsWith(href)
                    const subs = subCategories[href]
                    return (
                        <div key={href}>
                            <Link
                                href={href}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors block ${
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                            >
                                {label}
                            </Link>
                            {isActive && subs && (
                                <div className="ml-3 mt-0.5 flex flex-col gap-0.5">
                                    {subs.map((sub) => {
                                        const subHref = `${href}/${sub.slug}`
                                        const isSubActive = pathname.startsWith(subHref)
                                        return (
                                            <Link
                                                key={sub.slug}
                                                href={subHref}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors block ${
                                                    isSubActive
                                                        ? "text-primary bg-primary/5"
                                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                }`}
                                            >
                                                {sub.label}
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </nav>
            <div className="mt-4 border-t max-lg:hidden" />
        </div>
    )
}
