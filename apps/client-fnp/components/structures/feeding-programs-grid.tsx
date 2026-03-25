"use client"

import Link from "next/link"
import { Layers, ChevronRight, Filter } from "lucide-react"
import { capitalizeFirstLetter } from "@/lib/utilities"
import { useQueryState, parseAsString } from "nuqs"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"

function getAnimalGroup(farmProduceName: string): string {
  const name = farmProduceName.toLowerCase()
  if (name.startsWith("chicken")) return "chickens"
  if (name.startsWith("cattle") || name.startsWith("beef")) return "cattle"
  if (name.startsWith("pig") || name.startsWith("pork")) return "pigs"
  if (name.startsWith("sheep") || name.startsWith("lamb")) return "sheep"
  if (name.startsWith("goat")) return "goats"
  if (name.startsWith("duck")) return "ducks"
  if (name.startsWith("turkey")) return "turkeys"
  return farmProduceName.split("(")[0].trim().toLowerCase()
}

interface FeedingProgramsGridProps {
  programs: any[]
}

function FilterNav({ groups, counts, active, onSelect }: {
  groups: string[]
  counts: Record<string, number>
  active: string | null
  onSelect: (g: string | null) => void
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Livestock Type</p>
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
          <span className="text-xs text-muted-foreground">{Object.values(counts).reduce((a, b) => a + b, 0)}</span>
        </button>
        {groups.map((group) => (
          <button
            key={group}
            onClick={() => onSelect(group)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
              active === group
                ? "bg-primary/10 text-primary font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <span>{capitalizeFirstLetter(group)}</span>
            <span className="text-xs text-muted-foreground">{counts[group] || 0}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export function FeedingProgramsGrid({ programs }: FeedingProgramsGridProps) {
  const [animal, setAnimal] = useQueryState("animal", parseAsString)
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  const groups: string[] = []
  const counts: Record<string, number> = {}
  for (const p of programs) {
    const g = getAnimalGroup(p.farm_produce_name || "")
    if (!groups.includes(g)) groups.push(g)
    counts[g] = (counts[g] || 0) + 1
  }

  const filtered = animal
    ? programs.filter((p: any) => getAnimalGroup(p.farm_produce_name || "") === animal)
    : programs

  const handleSelect = (g: string | null) => {
    setAnimal(g)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="lg:grid lg:grid-cols-[180px_1fr] lg:gap-8">
      {/* Desktop sidebar */}
      {isDesktop ? (
        <nav className="hidden lg:block">
          <div className="sticky top-20">
            <FilterNav groups={groups} counts={counts} active={animal} onSelect={handleSelect} />
          </div>
        </nav>
      ) : (
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full mb-4">
              <Filter className="mr-2 h-4 w-4" />
              Filter by Livestock
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle>Filter Programs</SheetTitle>
            </SheetHeader>
            <FilterNav groups={groups} counts={counts} active={animal} onSelect={handleSelect} />
          </SheetContent>
        </Sheet>
      )}

      {/* Grid */}
      <div className="min-w-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((program: any) => (
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
      </div>
    </div>
  )
}
