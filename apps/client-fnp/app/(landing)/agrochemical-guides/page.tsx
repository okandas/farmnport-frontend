import Link from "next/link"
import Image from "next/image"
import {
    Pill, Bug, Droplet, Rat, TrendingUp, Beaker, Shell, Shield,
    ArrowRight, ChevronRight, BookOpen, FlaskConical
} from "lucide-react"
import { BaseURL } from "@/lib/schemas"
import { capitalizeFirstLetter } from "@/lib/utilities"
import { GuidesSearch } from "@/components/agrochemical/GuidesSearch"
import { GuidesHeroActions } from "@/components/agrochemical/GuidesHeroActions"

const fetchOptions: RequestInit = process.env.NODE_ENV === "production"
    ? { next: { revalidate: 3600 } } as RequestInit
    : { cache: "no-store" }

const categoryIcons: Record<string, any> = {
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

async function getCategories() {
    try {
        const res = await fetch(`${BaseURL}/agrochemicalcategories/`, fetchOptions)
        if (!res.ok) return []
        const data = await res.json()
        return data?.data || []
    } catch {
        return []
    }
}

async function getSprayPrograms() {
    try {
        const res = await fetch(`${BaseURL}/sprayprograms/`, fetchOptions)
        if (!res.ok) return []
        const data = await res.json()
        return data?.data || []
    } catch {
        return []
    }
}

export default async function AgrochemicalGuidesPage() {
    const [categories, sprayPrograms] = await Promise.all([
        getCategories(),
        getSprayPrograms(),
    ])

    return (
        <main className="bg-gradient-to-b from-background to-muted/20">
            {/* Hero Section */}
            <section className="py-16 lg:py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/60 via-transparent to-emerald-50/40 dark:from-green-950/20 dark:to-emerald-950/10" />
                <div className="absolute top-20 left-10 w-72 h-72 bg-green-200/20 dark:bg-green-800/10 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-200/20 dark:bg-emerald-800/10 rounded-full blur-3xl" />

                <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-sm font-medium mb-6">
                            <FlaskConical className="h-4 w-4" />
                            Your Crop Protection Hub
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl font-heading mb-5">
                            Agrochemical Guides &{" "}
                            <span className="text-primary">Spray Programs</span>
                        </h1>
                        <p className="text-lg text-muted-foreground leading-7 mb-8 max-w-2xl mx-auto">
                            Search active ingredients, discover how pesticides and herbicides work,
                            and follow step-by-step spray programs for every growth stage.
                        </p>

                        {/* Quick Search */}
                        <div className="mb-8">
                            <GuidesSearch />
                        </div>

                        <GuidesHeroActions />
                    </div>
                </div>
            </section>


            {/* Spray Programs Section */}
            {sprayPrograms.length > 0 && (
                <section className="py-10 lg:py-14">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="flex items-end justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                                    STEP-BY-STEP GUIDES
                                </div>
                                <h2 className="text-2xl font-bold tracking-tight font-heading">
                                    Crop Spray Programs
                                </h2>
                                <p className="text-muted-foreground mt-1 max-w-lg text-sm">
                                    Know exactly what to spray, when to spray, and how much to use at every growth stage.
                                </p>
                            </div>
                            <Link
                                href="/spray-programs"
                                className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                            >
                                View All Spray Programs
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {sprayPrograms.slice(0, 4).map((program: any) => (
                                <Link
                                    key={program.id}
                                    href={`/spray-programs/${program.slug}`}
                                    className="group rounded-xl border bg-card shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200"
                                >
                                    <div className="p-3">
                                        <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors line-clamp-1">
                                            {capitalizeFirstLetter(program.name)}
                                        </h3>
                                        {program.farm_produce_name && (
                                            <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 mb-1.5">
                                                {capitalizeFirstLetter(program.farm_produce_name)}
                                            </div>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <span>{program.stages?.length || 0} stages</span>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <Link
                            href="/spray-programs"
                            className="sm:hidden flex items-center justify-center gap-1 text-sm font-medium text-primary hover:underline mt-4"
                        >
                            View all spray programs
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>
            )}

            {/* Categories Section */}
            <section className="py-14 lg:py-20 bg-muted/30">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-8">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight font-heading">
                                Browse by Agrochemical Categories
                            </h2>
                            <p className="text-muted-foreground mt-2 max-w-lg">
                                Explore agrochemical products by type. Each guide includes active ingredients, targets, and usage information.
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

                    <Link
                        href="/agrochemical-guides/all"
                        className="sm:hidden flex items-center justify-center gap-1 text-sm font-medium text-primary hover:underline mb-6"
                    >
                        View All Agrochemical Products
                        <ArrowRight className="h-4 w-4" />
                    </Link>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {categories.map((category: any) => {
                            const Icon = categoryIcons[category.slug] || Pill
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

                </div>
            </section>
        </main>
    )
}
