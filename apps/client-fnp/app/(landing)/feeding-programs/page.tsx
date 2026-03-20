"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Egg, Layers, ChevronRight } from "lucide-react"
import { queryPublishedFeedingPrograms } from "@/lib/query"
import { capitalizeFirstLetter } from "@/lib/utilities"

export default function FeedingProgramsPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["feeding-programs"],
        queryFn: () => queryPublishedFeedingPrograms(),
        refetchOnWindowFocus: false,
    })

    const programs = data?.data?.data || []

    return (
        <main>
            <section className="border-b">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-10 pb-8">
                    <p className="text-xs font-semibold text-primary tracking-wide uppercase">Animal Nutrition</p>
                    <h1 className="mt-1 text-3xl font-bold font-heading tracking-tight">Feeding Programs</h1>
                    <p className="mt-2 text-sm text-muted-foreground">Structured feeding schedules for optimal livestock growth and nutrition at every stage.</p>
                </div>
            </section>
            <section className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
                {isLoading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse rounded-xl border bg-card p-4 space-y-3">
                                <div className="h-5 bg-muted rounded w-3/4" />
                                <div className="h-4 bg-muted rounded w-full" />
                                <div className="h-4 bg-muted rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                )}
                {!isLoading && programs.length === 0 && (
                    <div className="text-center py-16">
                        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Egg className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-lg font-semibold mb-1">No Feeding Programs Yet</h2>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">We're working on creating comprehensive feeding programs. Check back soon.</p>
                    </div>
                )}
                {!isLoading && programs.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {programs.map((program: any) => (
                            <Link key={program.id} href={`/feeding-programs/${program.slug}`} className="group rounded-xl border bg-card overflow-hidden hover:shadow-md hover:border-primary/20 transition-all">
                                <div className="p-4">
                                    <h2 className="text-sm font-bold font-heading mb-1 group-hover:text-primary transition-colors">{capitalizeFirstLetter(program.name)}</h2>
                                    {program.farm_produce_name && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10 dark:bg-amber-950/30 dark:text-amber-400 mb-2">{capitalizeFirstLetter(program.farm_produce_name)}</span>
                                    )}
                                    {program.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{program.description}</p>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                            <Layers className="h-3 w-3" />
                                            <span>{program.stages?.length || 0} stages</span>
                                        </div>
                                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </main>
    )
}
