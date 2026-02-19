"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { AuthenticatedUser } from "@/lib/schemas"
import { TrendingUp, Users, ShoppingBag, BookOpen } from "lucide-react"
import { queryDashboardAggregates } from "@/lib/query"

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
  const pricesCount = aggregates?.data?.prices_count || 0
  const guidesCount = aggregates?.data?.guides_count || 0
  const mainProduceSlug = aggregates?.data?.main_produce_slug || ""
  const counterpartyByProduce = aggregates?.data?.counterparty_by_produce || []
  const counterpartyByCategory = aggregates?.data?.counterparty_by_category || []

  // Determine label based on user type - farmers see buyers, buyers see farmers
  const counterpartyLabel = isBuyer ? "Farmers" : "Buyers"
  const counterpartyRoute = isBuyer ? "/farmers" : "/buyers"

  // For similar users (same type)
  const similarUserLabel = isBuyer ? "Buyers" : "Farmers"
  const similarUserRoute = isBuyer ? "/buyers" : "/farmers"


  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight font-heading mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Here&apos;s how you can manage your {businessType} today
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Market Prices"
            value={isLoading ? "..." : `${pricesCount.toLocaleString()}`}
            icon={<TrendingUp className="w-6 h-6" />}
            href="/prices"
            description="Check latest market prices"
          />
          <StatCard
            title={counterpartyLabel}
            value={isLoading ? "..." : `${counterpartyCount.toLocaleString()}`}
            icon={<Users className="w-6 h-6" />}
            href={counterpartyRoute}
            description={`Connect with verified ${counterpartyLabel.toLowerCase()}`}
          />

          {/* Similar Users Card */}
          {!isLoading && (counterpartyByCategory.length > 0 || counterpartyByProduce.length > 0) && (
            <div className="bg-card border rounded-lg p-6 hover:border-primary/50 hover:shadow-md transition-all flex flex-col">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Similar {similarUserLabel}</h3>
              </div>

              <div className="space-y-2">
                {/* Category */}
                {counterpartyByCategory.length > 0 && counterpartyByCategory.map((item: any, index: number) => (
                  <Link
                    key={`category-${index}`}
                    href={`${similarUserRoute}?category=${item.name.toLowerCase()}`}
                    className="w-full group text-left bg-muted/30 hover:bg-primary/10 active:bg-primary/20 rounded-lg p-3 transition-all border border-transparent hover:border-primary/20 block"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                        {item.name}
                      </span>
                      <span className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{item.count.toLocaleString()}</span>
                    </div>
                  </Link>
                ))}

                {/* Produce */}
                {counterpartyByProduce.length > 0 && counterpartyByProduce.map((item: any, index: number) => (
                  <Link
                    key={`produce-${index}`}
                    href={`${similarUserRoute}?produce=${item.name.toLowerCase()}`}
                    className="w-full group text-left bg-muted/30 hover:bg-primary/10 active:bg-primary/20 rounded-lg p-3 transition-all border border-transparent hover:border-primary/20 block"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                        {item.name}
                      </span>
                      <span className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{item.count.toLocaleString()}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <StatCard
            title="Guides"
            value={isLoading ? "..." : guidesCount === 0 ? "Browse All" : `${guidesCount.toLocaleString()}`}
            icon={<BookOpen className="w-6 h-6" />}
            href={guidesCount === 0 ? "/agrochemical-guides/all" : `/agrochemical-guides/all?used_on=${mainProduceSlug}`}
            description={guidesCount === 0 ? "See all agrochemical guides" : "Expert agrochemical info"}
          />
        </div>

        {/* Shop CTA */}
        <Link href="/waiting-list-shop">
          <div className="bg-card border rounded-lg p-6 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg text-primary">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">Shop - Coming Soon</h3>
                <p className="text-sm text-muted-foreground">Quality farm inputs delivered to your door</p>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </main>
  )
}

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  href: string
  description: string
}

function StatCard({ title, value, icon, href, description }: StatCardProps) {
  return (
    <Link href={href} className="h-full">
      <div className="bg-card border rounded-lg p-6 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            {icon}
          </div>
        </div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3 leading-snug">{title}</h3>
        <p className="text-2xl font-bold mb-3 leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground leading-normal">{description}</p>
      </div>
    </Link>
  )
}
