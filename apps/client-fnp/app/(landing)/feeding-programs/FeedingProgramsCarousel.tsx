"use client"

import { useRef } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Layers } from "lucide-react"
import { titleCase, capitalizeFirstLetter } from "@/lib/utilities"

function ProgramCard({ program }: { program: any }) {
    return (
        <Link
            href={`/feeding-programs/${program.slug}`}
            className="shrink-0 w-44 sm:w-48 rounded-lg border bg-card overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-200 group flex flex-col"
        >
            <div className="p-3 flex-1">
                <p className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors mb-1.5">{titleCase(program.name)}</p>
                {program.farm_produce_name && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10 dark:bg-amber-950/30 dark:text-amber-400 mb-2">{capitalizeFirstLetter(program.farm_produce_name)}</span>
                )}
                {program.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{program.description}</p>
                )}
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Layers className="h-3 w-3" />
                    <span>{program.stages?.length || 0} stages</span>
                </div>
            </div>
        </Link>
    )
}

export function FeedingProgramsCarousel({ programs }: { programs: any[] }) {
    const scrollRef = useRef<HTMLDivElement>(null)

    function scroll(dir: "left" | "right") {
        scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" })
    }

    return (
        <div className="relative">
            <button
                onClick={() => scroll("left")}
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center h-9 w-9 rounded-full border bg-background shadow-sm hover:bg-muted transition-colors"
            >
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide py-1 px-1">
                {programs.map((program) => (
                    <ProgramCard key={program.id || program._id} program={program} />
                ))}
            </div>
            <button
                onClick={() => scroll("right")}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center h-9 w-9 rounded-full border bg-background shadow-sm hover:bg-muted transition-colors"
            >
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
        </div>
    )
}
