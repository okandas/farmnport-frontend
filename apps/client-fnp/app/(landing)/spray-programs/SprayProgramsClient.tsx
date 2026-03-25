"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Layers, ChevronRight, Search, X, Filter } from "lucide-react"
import { capitalizeFirstLetter } from "@/lib/utilities"
import { useQueryState, parseAsString } from "nuqs"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"

interface SprayProgramsClientProps {
    programs: any[]
}

function FilterNav({ cropGroups, counts, active, onSelect }: {
    cropGroups: string[]
    counts: Record<string, number>
    active: string | null
    onSelect: (g: string | null) => void
}) {
    const total = Object.values(counts).reduce((a, b) => a + b, 0)

    return (
        <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Crop Group</p>
            <div className="space-y-0.5">
                <button
                    onClick={() => onSelect(null)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        active === null
                            ? "bg-primary/10 text-primary font-semibold"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                >
                    <span>All</span>
                    <span className="text-xs text-muted-foreground">{total}</span>
                </button>
                {cropGroups.map((name) => (
                    <button
                        key={name}
                        onClick={() => onSelect(name)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                            active === name
                                ? "bg-primary/10 text-primary font-semibold"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                    >
                        <span>{capitalizeFirstLetter(name)}</span>
                        <span className="text-xs text-muted-foreground">{counts[name] || 0}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}

export function SprayProgramsClient({ programs }: SprayProgramsClientProps) {
    const [group, setGroup] = useQueryState("group", parseAsString)
    const [search, setSearch] = useState("")
    const isDesktop = useMediaQuery("(min-width: 1024px)")

    const cropGroups = useMemo(() => {
        const names = new Set<string>()
        for (const p of programs) {
            if (p.crop_group_name) names.add(p.crop_group_name.toLowerCase())
        }
        return Array.from(names).sort()
    }, [programs])

    const counts = useMemo(() => {
        const c: Record<string, number> = {}
        for (const p of programs) {
            const g = (p.crop_group_name || "other").toLowerCase()
            c[g] = (c[g] || 0) + 1
        }
        return c
    }, [programs])

    const filtered = programs.filter((p: any) => {
        if (group && (p.crop_group_name || "").toLowerCase() !== group) return false
        if (search) {
            const q = search.toLowerCase()
            const name = (p.name || "").toLowerCase()
            const produce = (p.farm_produce_name || "").toLowerCase()
            const desc = (p.description || "").toLowerCase()
            if (!name.includes(q) && !produce.includes(q) && !desc.includes(q)) return false
        }
        return true
    })

    const handleSelect = (g: string | null) => {
        setGroup(g)
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    return (
        <section className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
            {programs.length === 0 ? (
                <div className="text-center py-16">
                    <h2 className="text-lg font-semibold mb-1">No Spray Programs Yet</h2>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        We&apos;re working on creating comprehensive spray programs. Check back soon.
                    </p>
                </div>
            ) : (
                <div className="lg:grid lg:grid-cols-[180px_1fr] lg:gap-8">
                    {/* Sidebar */}
                    {isDesktop ? (
                        <nav className="hidden lg:block">
                            <div className="sticky top-20">
                                <FilterNav cropGroups={cropGroups} counts={counts} active={group} onSelect={handleSelect} />
                            </div>
                        </nav>
                    ) : (
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="w-full mb-4">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filter by Crop Group
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[280px] overflow-y-auto">
                                <SheetHeader className="mb-4">
                                    <SheetTitle>Filter Programs</SheetTitle>
                                </SheetHeader>
                                <FilterNav cropGroups={cropGroups} counts={counts} active={group} onSelect={handleSelect} />
                            </SheetContent>
                        </Sheet>
                    )}

                    {/* Content */}
                    <div className="min-w-0">
                        {/* Search */}
                        <div className="relative max-w-sm mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search spray programs..."
                                className="w-full pl-9 pr-9 py-1.5 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
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

                        {/* Grid */}
                        {filtered.length > 0 ? (
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
                        ) : (
                            <div className="text-center py-16">
                                <h2 className="text-lg font-semibold mb-1">No programs found</h2>
                                <p className="text-sm text-muted-foreground">
                                    No spray programs match {search ? `"${search}"` : "the selected filter"}.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    )
}
