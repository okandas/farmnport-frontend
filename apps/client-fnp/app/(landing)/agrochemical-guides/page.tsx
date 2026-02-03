"use client"

import { sendGTMEvent } from "@next/third-parties/google"
import Link from "next/link"
import { ArrowRight, Pill, Leaf, Bug, Droplet, Rat, TrendingUp, Beaker, Shell, Shield } from "lucide-react"
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
            <section className="py-16 lg:py-24 relative overflow-hidden">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
                        {/* Left Column - Hero Content */}
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl font-heading mb-6">
                                Your Complete Agrochemical Guide
                            </h1>
                            <p className="text-lg text-muted-foreground leading-8">
                                Search active ingredients, discover how pesticides and herbicides work, find what targets specific pests and diseases, then shop trusted brands for the right products.
                            </p>
                        </div>

                        {/* Right Column - Buttons */}
                        <div className="mt-12 lg:mt-0 flex items-center justify-center">
                            <div className="flex gap-4">
                                <Button
                                    size="lg"
                                    asChild
                                    onClick={() => sendGTMEvent({ event: "click", value: "ReadGuides" })}
                                >
                                    <Link href="/agrochemical-guides/all">
                                        Read Guides
                                    </Link>
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    asChild
                                    onClick={() => sendGTMEvent({ event: "click", value: "BuyChemicals" })}
                                    className="group"
                                >
                                    <Link href="/shop" className="flex items-center gap-2">
                                        Buy Chemicals
                                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Categories Grid */}
                    <div className="mt-16">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {categories.map((category: any) => {
                                const Icon = categoryIcons[category.slug] || Pill
                                return (
                                    <Link
                                        key={category.slug}
                                        href={`/agrochemical-guides/${category.slug}`}
                                        className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card border border-border hover:border-primary hover:bg-accent transition-all group"
                                    >
                                        <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
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
                </div>
            </section>
        </main>
    )
}
