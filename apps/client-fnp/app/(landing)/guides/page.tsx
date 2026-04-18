import Link from "next/link"
import {
    Pill, Bug, Droplet, Rat, TrendingUp, Beaker, Shell, Shield,
    ArrowRight, FlaskConical, Syringe, Heart, Scissors, Cross, Zap, Baby
} from "lucide-react"
import { BaseURL } from "@/lib/schemas"

const fetchOptions: RequestInit = process.env.NODE_ENV === "production"
    ? { next: { revalidate: 3600 } } as RequestInit
    : { cache: "no-store" }

const agroIcons: Record<string, any> = {
    "insecticides": Bug,
    "fungicides": Shield,
    "herbicides": Droplet,
    "acaricides": Bug,
    "nematicides": Droplet,
    "rodenticides": Rat,
    "plant-growth-regulators": TrendingUp,
    "adjuvants": Beaker,
    "molluscicides": Shell,
    "bactericides": Pill,
}

const animalHealthIcons: Record<string, any> = {
    "vaccines": Syringe,
    "antibiotics": Pill,
    "nutrition-supplements": Heart,
    "anti-protozoa": Shield,
    "biosecurity-disinfectants": Shield,
    "tick-flea-control": Bug,
    "worm-fluke-control": Scissors,
    "wound-remedies": Cross,
    "fly-control": Zap,
    "stud-management": Baby,
    "equipment": Beaker,
}

async function getAgroCategories() {
    try {
        const res = await fetch(`${BaseURL}/agrochemicalcategories/`, fetchOptions)
        if (!res.ok) return []
        const data = await res.json()
        return data?.data || []
    } catch {
        return []
    }
}

async function getAnimalHealthCategories() {
    try {
        const res = await fetch(`${BaseURL}/animalhealthcategories/`, fetchOptions)
        if (!res.ok) return []
        const data = await res.json()
        return data?.data || []
    } catch {
        return []
    }
}

export default async function GuidesPage() {
    const [agroCategories, animalHealthCategories] = await Promise.all([
        getAgroCategories(),
        getAnimalHealthCategories(),
    ])

    return (
        <main className="bg-gradient-to-b from-background to-muted/20">
            {/* Hero */}
            <section className="py-16 lg:py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/60 via-transparent to-emerald-50/40 dark:from-green-950/20 dark:to-emerald-950/10" />
                <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-sm font-medium mb-6">
                            <FlaskConical className="h-4 w-4" />
                            Your Farming Knowledge Hub
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl font-heading mb-5">
                            Agrochemical &{" "}
                            <span className="text-primary">Animal Health Guides</span>
                        </h1>
                        <p className="text-lg text-muted-foreground leading-7 max-w-2xl mx-auto">
                            Dosage rates, active ingredients, and application guidelines for crop protection and livestock health — all in one place.
                        </p>
                    </div>
                </div>
            </section>

            {/* Agrochemical Categories */}
            <section className="py-14 lg:py-20 bg-muted/30">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight font-heading">
                                Agrochemical Guides
                            </h2>
                            <p className="text-muted-foreground mt-2 max-w-lg">
                                Pesticides, herbicides, and fungicides — active ingredients, targets, and usage by category.
                            </p>
                        </div>
                        <Link
                            href="/agrochemical-guides/all"
                            className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                            View All Agrochemical Products
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {agroCategories.map((category: any) => {
                            const Icon = agroIcons[category.slug] || Pill
                            return (
                                <Link
                                    key={category.slug}
                                    href={`/agrochemical-guides/${category.slug}`}
                                    className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border hover:border-primary hover:shadow-md transition-all group"
                                >
                                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                        <Icon className="w-6 h-6 text-primary" strokeWidth={2} />
                                    </div>
                                    <span className="text-sm font-medium text-center text-foreground group-hover:text-primary transition-colors">
                                        {category.name}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>

                    <Link
                        href="/agrochemical-guides/all"
                        className="sm:hidden flex items-center justify-center gap-1 text-sm font-medium text-primary hover:underline mt-6"
                    >
                        View All Agrochemical Products
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>

            {/* Animal Health Categories */}
            <section className="py-14 lg:py-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight font-heading">
                                Animal Health Guides
                            </h2>
                            <p className="text-muted-foreground mt-2 max-w-lg">
                                Vaccines, antibiotics, and supplements — dosage rates, withdrawal periods, and active ingredients for poultry and livestock.
                            </p>
                        </div>
                        <Link
                            href="/animal-health-guides/all"
                            className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        >
                            View All Animal Health Products
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {animalHealthCategories.map((category: any) => {
                            const Icon = animalHealthIcons[category.slug] || Pill
                            return (
                                <Link
                                    key={category.slug}
                                    href={`/animal-health-guides/${category.slug}`}
                                    className="flex flex-col items-center gap-3 p-5 rounded-xl bg-card border border-border hover:border-primary hover:bg-accent transition-all group"
                                >
                                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                        <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
                                    </div>
                                    <span className="text-sm font-medium text-center text-foreground group-hover:text-primary transition-colors">
                                        {category.name}
                                    </span>
                                </Link>
                            )
                        })}
                    </div>

                    <Link
                        href="/animal-health-guides/all"
                        className="sm:hidden flex items-center justify-center gap-1 text-sm font-medium text-primary hover:underline mt-6"
                    >
                        View All Animal Health Products
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </section>
        </main>
    )
}
