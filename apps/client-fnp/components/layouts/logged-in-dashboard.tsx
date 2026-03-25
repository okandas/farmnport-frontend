"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { sendGTMEvent } from "@next/third-parties/google"
import { ArrowRight, ChevronRight, FlaskConical, Layers } from "lucide-react"
import { AuthenticatedUser } from "@/lib/schemas"
import { queryDashboardAggregates, queryAnimalHealthCategories, queryPublishedFeedingPrograms } from "@/lib/query"
import { capitalizeFirstLetter, unSlug } from "@/lib/utilities"
import { Badge } from "@/components/ui/badge"

// Prefix-based matching for animal produce slugs (e.g. "chickens-broilers", "chicken-meat", "chicken-eggs")
const ANIMAL_PREFIXES = [
  "chicken", "cattle", "beef", "pork", "pig",
  "goat", "sheep", "lamb", "mutton",
  "duck", "turkey", "rabbit", "ostrich",
  "tilapia", "trout", "catfish"
]

function isAnimalProduce(slug: string): boolean {
  const lower = slug.toLowerCase()
  return ANIMAL_PREFIXES.some(p => lower === p || lower.startsWith(p))
}

// Map produce slug prefixes to the used_on value for animal health filtering
function normalizeAnimal(slug: string): string {
  const lower = slug.toLowerCase()
  if (lower.startsWith("chicken")) return "chicken"
  if (lower.startsWith("cattle") || lower.startsWith("beef")) return "cattle"
  if (lower.startsWith("pork") || lower.startsWith("pig")) return "pigs"
  if (lower.startsWith("sheep") || lower.startsWith("lamb") || lower.startsWith("mutton")) return "sheep"
  if (lower.startsWith("goat")) return "goats"
  if (lower.startsWith("duck")) return "ducks"
  if (lower.startsWith("turkey")) return "turkeys"
  if (lower.startsWith("rabbit")) return "rabbits"
  if (lower.startsWith("ostrich")) return "ostriches"
  return lower
}


interface LoggedInDashboardProps {
  user: AuthenticatedUser
}

export function LoggedInDashboard({ user }: LoggedInDashboardProps) {
  const isBuyer = user?.type === 'buyer'
  const businessType = isBuyer ? 'buying business' : 'agribusiness'

  const { data: aggregates, isLoading } = useQuery({
    queryKey: ["dashboard-aggregates"],
    queryFn: queryDashboardAggregates,
    refetchOnWindowFocus: false,
  })

  const counterpartyCount = aggregates?.data?.counterparty_count || 0
  const mainProduceSlug = aggregates?.data?.main_produce_slug || ""
  const displayName = mainProduceSlug ? capitalizeFirstLetter(unSlug(mainProduceSlug)) : ""
  const isAnimal = isAnimalProduce(mainProduceSlug)
  const animal = isAnimal ? normalizeAnimal(mainProduceSlug) : ""

  // User profile data from enriched response
  const mainProduce = aggregates?.data?.main_produce
  const otherProduce: any[] = aggregates?.data?.other_produce || []
  const primaryCategory = aggregates?.data?.primary_category

  // Collect all animal produce for matching
  const allProduceSlugs: string[] = []
  if (mainProduceSlug) allProduceSlugs.push(mainProduceSlug)
  for (const p of otherProduce) {
    if (p.slug && !allProduceSlugs.includes(p.slug)) allProduceSlugs.push(p.slug)
  }
  const uniqueAnimals = [...new Set(allProduceSlugs.filter(isAnimalProduce).map(normalizeAnimal))]
  const otherAnimals = uniqueAnimals.filter(a => a !== animal)

  const counterpartyLabel = isBuyer ? "Farmers" : "Buyers"
  const counterpartyRoute = isBuyer ? "/farmers" : "/buyers"

  const { data: categoriesData } = useQuery({
    queryKey: ["animal-health-categories", animal],
    queryFn: () => queryAnimalHealthCategories(animal),
    enabled: isAnimal && !isLoading && !!animal,
    refetchOnWindowFocus: false,
  })

  const categories = categoriesData?.data?.data || []

  // Fetch feeding programs matched to user's animals
  const { data: feedingProgramsData } = useQuery({
    queryKey: ["dashboard-feeding-programs"],
    queryFn: () => queryPublishedFeedingPrograms(),
    enabled: uniqueAnimals.length > 0 && !isLoading,
    refetchOnWindowFocus: false,
  })
  const allFeedingPrograms = feedingProgramsData?.data?.data || []
  const matchedFeedingPrograms = allFeedingPrograms.filter((p: any) => {
    const programAnimal = p.farm_produce_name?.toLowerCase()
    return uniqueAnimals.some(a => a === programAnimal)
  })

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight font-heading mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Here&apos;s how you can manage your {businessType} today
          </p>
          {!isLoading && (primaryCategory || mainProduce) && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              {primaryCategory && (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {capitalizeFirstLetter(primaryCategory.name)}
                </Badge>
              )}
              {mainProduce && (
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                  {capitalizeFirstLetter(mainProduce.name)}
                </Badge>
              )}
              {otherProduce.map((p: any) => (
                <Badge key={p.slug} variant="outline">
                  {capitalizeFirstLetter(p.name)}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {!isLoading && mainProduceSlug && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {/* Ready to Sell */}
            <section>
              <h2 className="text-2xl font-bold tracking-tight font-heading mb-4">Ready to Sell</h2>
              <Link href={`${counterpartyRoute}/${mainProduceSlug}`} className="block">
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800/30 rounded-lg p-6 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">Find {counterpartyLabel} for {displayName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {counterpartyCount > 0
                          ? `${counterpartyCount.toLocaleString()} ${counterpartyLabel.toLowerCase()} available to possibly buy your produce`
                          : `Browse ${counterpartyLabel.toLowerCase()} on the platform`}
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            </section>

            {/* Animal Health Categories */}
            {isAnimal && (
              <section>
                <h2 className="text-2xl font-bold tracking-tight font-heading mb-4">
                  Animal Health for Your {displayName} Business
                </h2>
                {categories.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat: any) => (
                      <Link
                        key={cat.id}
                        href={`/animal-health-guides/${cat.slug}?used_on=${animal}`}
                        className="flex items-center justify-between rounded-lg border bg-card p-3 hover:border-primary/50 hover:shadow-sm transition group"
                        onClick={() => sendGTMEvent({ event: "click", value: `DashboardHealthCategory_${cat.slug}` })}
                      >
                        <span className="text-sm font-medium truncate">{capitalizeFirstLetter(cat.name)}</span>
                        <div className="flex items-center gap-1 flex-none">
                          {cat.product_count > 0 && (
                            <span className="text-xs text-muted-foreground">{cat.product_count}</span>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 p-6 text-center">
                    <FlaskConical className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">
                      We&apos;re building {displayName.toLowerCase()} health product data
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Vaccines, supplements, and more — coming soon
                    </p>
                  </div>
                )}
              </section>
            )}
          </div>
        )}

        {/* Feeding Programs matched to user's livestock */}
        {!isLoading && matchedFeedingPrograms.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold tracking-tight font-heading">
                Feeding Programs for Your Livestock
              </h2>
              <Link href="/feeding-programs" className="text-sm text-primary hover:underline flex items-center gap-1">
                View all <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {matchedFeedingPrograms.slice(0, 6).map((program: any) => (
                <Link
                  key={program.id}
                  href={`/feeding-programs/${program.slug}`}
                  className="group rounded-lg border bg-card p-4 hover:shadow-md hover:border-primary/20 transition-all"
                  onClick={() => sendGTMEvent({ event: "click", value: `DashboardFeedProgram_${program.slug}` })}
                >
                  <h3 className="text-sm font-bold font-heading mb-1 group-hover:text-primary transition-colors">
                    {capitalizeFirstLetter(program.name)}
                  </h3>
                  {program.farm_produce_name && (
                    <Badge variant="secondary" className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 text-[10px] mb-2">
                      {capitalizeFirstLetter(program.farm_produce_name)}
                    </Badge>
                  )}
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Layers className="h-3 w-3" />
                    <span>{program.stages?.length || 0} stage feeding program</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Resources for other animals in user's produce list */}
        {!isLoading && otherAnimals.length > 0 && (
          <section className="mb-10">
            {otherAnimals.map(otherAnimal => {
              const display = capitalizeFirstLetter(otherAnimal)
              return (
                <div key={otherAnimal} className="mb-6">
                  <h3 className="text-lg font-bold tracking-tight font-heading mb-3">
                    {display} Resources
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <Link
                      href={`/animal-health-guides/vaccines?used_on=${otherAnimal}`}
                      className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:border-primary/50 hover:shadow-sm transition group"
                      onClick={() => sendGTMEvent({ event: "click", value: `DashboardVaccines_${otherAnimal}` })}
                    >
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">{display} Vaccines</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <Link
                      href={`/animal-health-guides/nutrition-supplements?used_on=${otherAnimal}`}
                      className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:border-primary/50 hover:shadow-sm transition group"
                      onClick={() => sendGTMEvent({ event: "click", value: `DashboardNutrition_${otherAnimal}` })}
                    >
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">{display} Nutrition</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <Link
                      href={`/feeding-programs?animal=${otherAnimal}`}
                      className="flex items-center gap-3 rounded-lg border bg-card p-3 hover:border-primary/50 hover:shadow-sm transition group"
                      onClick={() => sendGTMEvent({ event: "click", value: `DashboardFeedingPrograms_${otherAnimal}` })}
                    >
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">{display} Feeding Programs</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </section>
        )}

      </div>
    </main>
  )
}
