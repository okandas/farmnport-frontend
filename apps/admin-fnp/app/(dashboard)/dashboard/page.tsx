"use client"

import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import {
  Users,
  Package,
  Layers,
  Tag,
  DollarSign,
  ArrowRight,
  ChevronDown,
} from "lucide-react"
import { Pie, PieChart, Label } from "recharts"

import { queryDashboardStats } from "@/lib/query"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utilities"

interface DashboardStats {
  users: { total: number; farmers: number; buyers: number }
  products: {
    agro_chemicals: number
    animal_health: number
    feed: number
    total: number
  }
  guides: { spray_programs: number; feeding_programs: number }
  buyer_contacts: number
  brands: number
  producer_prices: number
  users_by_province: { province: string; value: number }[] | null
}

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 py-2 px-1 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            !open && "-rotate-90"
          )}
        />
        {title}
      </button>
      {open && <div className="mt-1">{children}</div>}
    </div>
  )
}

const productChartConfig = {
  value: {
    label: "Products",
  },
  agro_chemicals: {
    label: "Agro Chemicals",
    color: "hsl(var(--chart-1))",
  },
  animal_health: {
    label: "Animal Health",
    color: "hsl(var(--chart-2))",
  },
  feed: {
    label: "Feed",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

const userChartConfig = {
  value: {
    label: "Users",
  },
  farmers: {
    label: "Farmers",
    color: "hsl(var(--chart-1))",
  },
  buyers: {
    label: "Buyers",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => queryDashboardStats(),
    refetchOnWindowFocus: false,
  })

  const stats: DashboardStats | undefined = data?.data

  const productData = useMemo(() => {
    if (!stats) return []
    return [
      {
        category: "agro_chemicals",
        value: stats.products.agro_chemicals,
        fill: "var(--color-agro_chemicals)",
      },
      {
        category: "animal_health",
        value: stats.products.animal_health,
        fill: "var(--color-animal_health)",
      },
      {
        category: "feed",
        value: stats.products.feed,
        fill: "var(--color-feed)",
      },
    ]
  }, [stats])

  const userData = useMemo(() => {
    if (!stats) return []
    return [
      {
        type: "farmers",
        value: stats.users.farmers,
        fill: "var(--color-farmers)",
      },
      {
        type: "buyers",
        value: stats.users.buyers,
        fill: "var(--color-buyers)",
      },
    ]
  }, [stats])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="flex flex-col">
              <CardHeader className="items-center pb-0">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-56" />
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                <Skeleton className="mx-auto aspect-square max-h-[250px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your platform</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/dashboard/users"
          className="flex items-center gap-3 rounded-lg border bg-card p-3 text-card-foreground shadow-sm hover:bg-accent transition-colors"
        >
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium flex-1">View Users</span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>
        <Link
          href="/dashboard/agrochemicals"
          className="flex items-center gap-3 rounded-lg border bg-card p-3 text-card-foreground shadow-sm hover:bg-accent transition-colors"
        >
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium flex-1">Agrochemicals</span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>
        <Link
          href="/dashboard/feed-products"
          className="flex items-center gap-3 rounded-lg border bg-card p-3 text-card-foreground shadow-sm hover:bg-accent transition-colors"
        >
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium flex-1">Feed Products</span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>
        <Link
          href="/dashboard/prices"
          className="flex items-center gap-3 rounded-lg border bg-card p-3 text-card-foreground shadow-sm hover:bg-accent transition-colors"
        >
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium flex-1">Manage Prices</span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>
      </div>

      {/* Key Metrics */}
      <CollapsibleSection title="Key Metrics">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Users
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.users.farmers} farmers, {stats.users.buyers} buyers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.products.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.products.agro_chemicals} agro,{" "}
                {stats.products.animal_health} animal,{" "}
                {stats.products.feed} feed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Buyers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users.buyers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.users.total > 0
                  ? Math.round(
                      (stats.users.buyers / stats.users.total) * 100
                    )
                  : 0}
                % of total users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Guides</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.guides.spray_programs + stats.guides.feeding_programs}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.guides.spray_programs} spray,{" "}
                {stats.guides.feeding_programs} feeding
              </p>
            </CardContent>
          </Card>
        </div>
      </CollapsibleSection>

      {/* Additional Stats */}
      <CollapsibleSection title="Additional Stats">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Brands</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.brands}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Producer Prices
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.producer_prices}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Farmers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users.farmers}</div>
              <p className="text-xs text-muted-foreground">
                {stats.users.total > 0
                  ? Math.round(
                      (stats.users.farmers / stats.users.total) * 100
                    )
                  : 0}
                % of total users
              </p>
            </CardContent>
          </Card>
        </div>
      </CollapsibleSection>

      {/* Charts */}
      <CollapsibleSection title="Charts">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Products Donut */}
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>Products by Category</CardTitle>
              <CardDescription>Current product distribution</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={productChartConfig}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={productData}
                    dataKey="value"
                    nameKey="category"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {stats.products.total.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground text-sm"
                              >
                                Products
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="category" />}
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="leading-none text-muted-foreground">
                {stats.products.agro_chemicals} agro chemicals,{" "}
                {stats.products.animal_health} animal health,{" "}
                {stats.products.feed} feed
              </div>
            </CardFooter>
          </Card>

          {/* Users Donut */}
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>Users by Type</CardTitle>
              <CardDescription>Farmers vs Buyers</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer
                config={userChartConfig}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={userData}
                    dataKey="value"
                    nameKey="type"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {stats.users.total.toLocaleString()}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground text-sm"
                              >
                                Users
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="type" />}
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="leading-none text-muted-foreground">
                {stats.users.farmers} farmers, {stats.users.buyers} buyers
              </div>
            </CardFooter>
          </Card>
        </div>
      </CollapsibleSection>
    </div>
  )
}
