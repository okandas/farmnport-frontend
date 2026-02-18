"use client"

import { sendGTMEvent } from "@next/third-parties/google"
import Link from "next/link"
import { Pill, Leaf, Bug, Droplet, Rat, TrendingUp, Beaker, Shell, Shield, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQuery } from "@tanstack/react-query"
import { queryAgroChemicalCategories } from "@/lib/query"

const categoryIcons: Record<string, any> = {
    "insecticides": Bug,
    "fungicides": Shield,
    "herbicides": Leaf,
    "acaricides": Bug,
    "nematicides": Droplet,
    "rodenticides": Rat,
    "plant-growth-regulators": TrendingUp,
    "adjuvants": Beaker,
    "molluscicides": Shell,
    "bactericides": Pill,
}

export default function AgrochemicalGuidesPage() {
    const { data } = useQuery({
        queryKey: ["agrochemical-categories"],
        queryFn: () => queryAgroChemicalCategories(),
        refetchOnWindowFocus: false,
    })

    const categories = data?.data?.data || []

    return (
        <main className="bg-gradient-to-b from-background to-muted/20">
            {/* Hero Section */}
            <section className="py-12 lg:py-16 relative overflow-hidden">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Hero Content */}
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl font-heading mb-4">
                            Your Complete Agrochemical Guide
                        </h1>
                        <p className="text-lg text-muted-foreground leading-7 mb-6">
                            Search active ingredients, discover how pesticides and herbicides work, find what targets specific pests and diseases.
                        </p>
                        <Button
                            size="lg"
                            asChild
                            onClick={() => sendGTMEvent({ event: "click", value: "ReadGuides" })}
                            className="text-base px-6 py-5 h-auto font-semibold shadow-lg hover:shadow-xl transition-all group"
                        >
                            <Link href="/agrochemical-guides/all" className="flex items-center gap-2">
                                Browse All Guides
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>

                    {/* Categories Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {categories.map((category: any) => {
                            const Icon = categoryIcons[category.slug] || Pill
                            return (
                                <Link
                                    key={category.slug}
                                    href={`/agrochemical-guides/${category.slug}`}
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
                </div>
            </section>
        </main>
    )
}
