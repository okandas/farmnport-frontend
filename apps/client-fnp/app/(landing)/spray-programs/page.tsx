"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Layers, ChevronRight, Search, X } from "lucide-react"
import { queryPublishedSprayPrograms } from "@/lib/query"
import { capitalizeFirstLetter } from "@/lib/utilities"

export default function SprayProgramsPage() {
    const [filter, setFilter] = useState<string | null>(null)
    const [search, setSearch] = useState("")

    const { data, isLoading } = useQuery({
        queryKey: ["spray-programs"],
        queryFn: () => queryPublishedSprayPrograms(),
        refetchOnWindowFocus: false,
    })

    const programs = data?.data?.data || []

    // Extract unique crop groups for filter
    const cropGroups = useMemo(() => {
        const names = new Set<string>()
        for (const p of programs) {
            if (p.crop_group_name) names.add(p.crop_group_name)
        }
        return Array.from(names).sort()
    }, [programs])

    const filtered = programs.filter((p: any) => {
        if (filter && p.crop_group_name !== filter) return false
        if (search) {
            const q = search.toLowerCase()
            const name = (p.name || "").toLowerCase()
            const produce = (p.farm_produce_name || "").toLowerCase()
            const desc = (p.description || "").toLowerCase()
            if (!name.includes(q) && !produce.includes(q) && !desc.includes(q)) return false
        }
        return true
    })

    return (
        <main>
            {/* Header */}
            <section className="border-b">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-10 pb-8">
                    <p className="text-xs font-semibold text-primary tracking-wide uppercase">Crop Protection</p>
                    <h1 className="mt-1 text-3xl font-bold font-heading tracking-tight">
                        Spray Programs
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Step-by-step agrochemical application schedules for every growth stage.
                    </p>
                </div>
            </section>

            {/* Filter bar */}
            {!isLoading && cropGroups.length > 0 && (
                <div className="border-b bg-muted/30">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-3">
                        <div className="flex flex-wrap gap-1.5">
                            <button
                                onClick={() => setFilter(null)}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                    !filter
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                                }`}
                            >
                                All
                            </button>
                            {cropGroups.map((name) => (
                                <button
                                    key={name}
                                    onClick={() => setFilter(name)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                        filter === name
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                                    }`}
                                >
                                    {capitalizeFirstLetter(name)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <section className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
                {/* Search */}
                {!isLoading && programs.length > 0 && (
                    <div className="relative mb-6 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search spray programs..."
                            className="w-full pl-9 pr-9 py-2 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                )}

                {/* Loading State */}
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

                {/* Empty State */}
                {!isLoading && programs.length === 0 && (
                    <div className="text-center py-16">
                        <h2 className="text-lg font-semibold mb-1">No Spray Programs Yet</h2>
                        <p className="text-sm text-muted-foreground max-w-md mx-auto">
                            We&apos;re working on creating comprehensive spray programs. Check back soon.
                        </p>
                    </div>
                )}

                {/* Programs Grid */}
                {!isLoading && filtered.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map((program: any) => (
                            <Link
                                key={program.id}
                                href={`/spray-programs/${program.slug}`}
                                className="group rounded-xl border bg-card overflow-hidden hover:shadow-md hover:border-primary/20 transition-all"
                            >
                                <div className="p-4">
                                    <h2 className="text-sm font-bold font-heading mb-1 group-hover:text-primary transition-colors">
                                        {capitalizeFirstLetter(program.name)}
                                    </h2>

                                    {program.farm_produce_name && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10 dark:bg-amber-950/30 dark:text-amber-400 mb-2">
                                            {capitalizeFirstLetter(program.farm_produce_name)}
                                        </span>
                                    )}

                                    {program.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                            {program.description}
                                        </p>
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

                {/* No results */}
                {!isLoading && filtered.length === 0 && programs.length > 0 && (
                    <div className="text-center py-16">
                        <h2 className="text-lg font-semibold mb-1">No programs found</h2>
                        <p className="text-sm text-muted-foreground">
                            No spray programs match {search ? `"${search}"` : "the selected filter"}.
                        </p>
                    </div>
                )}
            </section>
        </main>
    )
}
