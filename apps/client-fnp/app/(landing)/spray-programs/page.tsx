"use client"

import Link from "next/link"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { Sprout, ArrowRight, Layers, ChevronRight } from "lucide-react"
import { queryPublishedSprayPrograms } from "@/lib/query"
import { capitalizeFirstLetter } from "@/lib/utilities"

export default function SprayProgramsPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["spray-programs"],
        queryFn: () => queryPublishedSprayPrograms(),
        refetchOnWindowFocus: false,
    })

    const programs = data?.data?.data || []

    return (
        <main className="bg-gradient-to-b from-background to-muted/20 min-h-screen">
            {/* Hero Section */}
            <section className="py-12 lg:py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-transparent to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10" />
                <div className="mx-auto max-w-7xl px-6 lg:px-8 relative">
                    <div className="text-center max-w-3xl mx-auto mb-14">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-sm font-medium mb-6">
                            <Sprout className="h-4 w-4" />
                            Crop Protection Made Simple
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl font-heading mb-5">
                            Crop Spray Programs
                        </h1>
                        <p className="text-lg text-muted-foreground leading-7">
                            Step-by-step agrochemical application schedules for every growth stage.
                            Know exactly what to spray, when to spray, and how much to use.
                        </p>
                    </div>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="animate-pulse rounded-xl border bg-card overflow-hidden">
                                    <div className="aspect-[16/9] bg-muted" />
                                    <div className="p-5 space-y-3">
                                        <div className="h-5 bg-muted rounded w-3/4" />
                                        <div className="h-4 bg-muted rounded w-full" />
                                        <div className="h-4 bg-muted rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State */}
                    {!isLoading && programs.length === 0 && (
                        <div className="text-center py-16">
                            <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                                <Sprout className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <h2 className="text-2xl font-semibold mb-2">No Spray Programs Yet</h2>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                We&apos;re working on creating comprehensive spray programs for various crops. Check back soon!
                            </p>
                        </div>
                    )}

                    {/* Programs Grid */}
                    {!isLoading && programs.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {programs.map((program: any) => (
                                <Link
                                    key={program.id}
                                    href={`/spray-programs/${program.slug}`}
                                    className="group rounded-xl border bg-card overflow-hidden hover:border-primary hover:shadow-lg transition-all duration-300"
                                >
                                    {/* Cover Image */}
                                    <div className="relative aspect-[16/9] bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 overflow-hidden">
                                        {program.cover_image?.img?.src ? (
                                            <Image
                                                src={program.cover_image.img.src}
                                                alt={program.name}
                                                fill
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Sprout className="w-16 h-16 text-green-300 dark:text-green-800" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Card Content */}
                                    <div className="p-5">
                                        <h2 className="text-lg font-semibold mb-1.5 group-hover:text-primary transition-colors">
                                            {capitalizeFirstLetter(program.name)}
                                        </h2>

                                        {program.farm_produce_name && (
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 mb-3">
                                                <Sprout className="h-3 w-3" />
                                                {capitalizeFirstLetter(program.farm_produce_name)}
                                            </div>
                                        )}

                                        {program.description && (
                                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                                {program.description}
                                            </p>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                <Layers className="h-3.5 w-3.5" />
                                                <span>{program.stages?.length || 0} stages</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                View Program
                                                <ChevronRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    )
}
