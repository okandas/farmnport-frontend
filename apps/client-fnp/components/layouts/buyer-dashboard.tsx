"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { sendGTMEvent } from "@next/third-parties/google"
import { ArrowRight } from "lucide-react"
import { AuthenticatedUser } from "@/lib/schemas"
import { queryDashboardAggregates, queryViewersList } from "@/lib/query"
import { capitalizeFirstLetter, unSlug } from "@/lib/utilities"
import { Badge } from "@/components/ui/badge"

interface BuyerDashboardProps {
  user: AuthenticatedUser
}

export function BuyerDashboard({ user }: BuyerDashboardProps) {
  const { data: aggregates, isLoading } = useQuery({
    queryKey: ["dashboard-aggregates"],
    queryFn: queryDashboardAggregates,
    refetchOnWindowFocus: false,
  })

  const mainProduceSlug = aggregates?.data?.main_produce_slug || ""
  const displayName = mainProduceSlug ? capitalizeFirstLetter(unSlug(mainProduceSlug)) : ""
  const mainProduce = aggregates?.data?.main_produce
  const otherProduce: any[] = aggregates?.data?.other_produce || []
  const primaryCategory = aggregates?.data?.primary_category

  const allProduce = [
    ...(mainProduceSlug ? [{ slug: mainProduceSlug, name: mainProduce?.name || unSlug(mainProduceSlug) }] : []),
    ...otherProduce,
  ]

  const { data: viewersData } = useQuery({
    queryKey: ["dashboard-viewers"],
    queryFn: queryViewersList,
    refetchOnWindowFocus: false,
  })
  const totalViewers: number = viewersData?.data?.total || 0

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight font-heading mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Here&apos;s how you can manage your buying business today
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 items-stretch">
            {/* Find Farmers */}
            <section className="flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold tracking-tight font-heading">Source Your Produce</h2>
              </div>
              <Link href={`/farmers/${mainProduceSlug}`} className="block">
                <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-800/30 rounded-lg p-6 hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">Find Farmers Selling {displayName}</h3>
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            </section>

            {/* Who Viewed Your Contact */}
            {totalViewers > 0 && (
              <section className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-2xl font-bold tracking-tight font-heading">Who Viewed Your Contact</h2>
                </div>
                <Link href="/profile/contact-views" className="block">
                  <div className="bg-white dark:bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">
                          You have {totalViewers} contact {totalViewers === 1 ? "view" : "views"}
                        </h3>
                        <p className="text-sm text-muted-foreground">See who viewed your contact details</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
              </section>
            )}
          </div>
        )}

        {/* Browse by Produce */}
        {!isLoading && allProduce.length > 1 && (
          <section className="mb-10">
            <div className="mb-4">
              <h2 className="text-2xl font-bold tracking-tight font-heading">You also source these</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Based on your buying profile — tap any to find farmers
              </p>
            </div>
            <ul className="space-y-1">
              {allProduce.map((p: any) => (
                <li key={p.slug}>
                  <Link
                    href={`/farmers/${p.slug}`}
                    className="flex items-center gap-2 text-sm py-1.5 text-foreground hover:text-primary transition-colors group"
                    onClick={() => sendGTMEvent({ event: "click", value: `BuyerDashboardProduce_${p.slug}` })}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary flex-shrink-0 transition-colors" />
                    {capitalizeFirstLetter(p.name || unSlug(p.slug))}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}


      </div>
    </main>
  )
}
