"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import {
  Users,
  Package,
  Layers,
  Tag,
  CreditCard,
  ArrowRight,
} from "lucide-react"

import { queryDashboardStats } from "@/lib/query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

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
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => queryDashboardStats(),
    refetchOnWindowFocus: false,
  })

  const stats: DashboardStats | undefined = data?.data

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 7 }).map((_, i) => (
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
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your platform</p>
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
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium flex-1">Manage Prices</span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
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
            <CreditCard className="h-4 w-4 text-muted-foreground" />
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
    </div>
  )
}
