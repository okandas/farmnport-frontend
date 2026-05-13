"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import {
  Users,
  Package,
  Tag,
  CreditCard,
  ArrowRight,
  Eye,
  BookOpen,
  TrendingUp,
} from "lucide-react"

import { queryDashboardStats, queryContactViewsStats } from "@/lib/query"
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
  contact_views: number
}

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: () => queryDashboardStats(),
    refetchOnWindowFocus: false,
  })

  const { data: viewsData } = useQuery({
    queryKey: ["admin-contact-views-stats"],
    queryFn: () => queryContactViewsStats(),
    refetchOnWindowFocus: false,
  })

  const stats: DashboardStats | undefined = data?.data
  const viewsSummary = viewsData?.data?.summary

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  const farmerPct = stats.users.total > 0 ? Math.round((stats.users.farmers / stats.users.total) * 100) : 0
  const buyerPct = stats.users.total > 0 ? Math.round((stats.users.buyers / stats.users.total) * 100) : 0
  const totalGuides = stats.guides.spray_programs + stats.guides.feeding_programs
  const sprayPct = totalGuides > 0 ? Math.round((stats.guides.spray_programs / totalGuides) * 100) : 0
  const feedingPct = totalGuides > 0 ? Math.round((stats.guides.feeding_programs / totalGuides) * 100) : 0
  const agroPct = stats.products.total > 0 ? Math.round((stats.products.agro_chemicals / stats.products.total) * 100) : 0
  const animalPct = stats.products.total > 0 ? Math.round((stats.products.animal_health / stats.products.total) * 100) : 0
  const feedPct = stats.products.total > 0 ? Math.round((stats.products.feed / stats.products.total) * 100) : 0

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Platform overview</p>
      </div>

      {/* Primary metrics */}
      <div className="grid gap-4 md:grid-cols-3">

        {/* Total Users */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Total Users</span>
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="text-3xl font-bold">{stats.users.total}</div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Farmers</span>
              <span className="font-medium">{stats.users.farmers} <span className="text-muted-foreground">({farmerPct}%)</span></span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${farmerPct}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Buyers</span>
              <span className="font-medium">{stats.users.buyers} <span className="text-muted-foreground">({buyerPct}%)</span></span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${buyerPct}%` }} />
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Total Products</span>
            <div className="h-8 w-8 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
              <Package className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="text-3xl font-bold">{stats.products.total}</div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Agro</span>
              <span className="font-medium">{stats.products.agro_chemicals} <span className="text-muted-foreground">({agroPct}%)</span></span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${agroPct}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Animal</span>
              <span className="font-medium">{stats.products.animal_health} <span className="text-muted-foreground">({animalPct}%)</span></span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${animalPct}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Feed</span>
              <span className="font-medium">{stats.products.feed} <span className="text-muted-foreground">({feedPct}%)</span></span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${feedPct}%` }} />
            </div>
          </div>
        </div>

        {/* Guides */}
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Guides</span>
            <div className="h-8 w-8 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
          <div className="text-3xl font-bold">{totalGuides}</div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Spray</span>
              <span className="font-medium">{stats.guides.spray_programs} <span className="text-muted-foreground">({sprayPct}%)</span></span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-teal-500 rounded-full" style={{ width: `${sprayPct}%` }} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Feeding</span>
              <span className="font-medium">{stats.guides.feeding_programs} <span className="text-muted-foreground">({feedingPct}%)</span></span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${feedingPct}%` }} />
            </div>
          </div>
        </div>

      </div>

      {/* Secondary metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Brands</span>
            <div className="h-8 w-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center">
              <Tag className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="text-3xl font-bold">{stats.brands}</div>
          <p className="text-xs text-muted-foreground mt-1">Registered brands</p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Producer Prices</span>
            <div className="h-8 w-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            </div>
          </div>
          <div className="text-3xl font-bold">{stats.producer_prices}</div>
          <p className="text-xs text-muted-foreground mt-1">Active price listings</p>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">Contact Views</span>
            <div className="h-8 w-8 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center">
              <Eye className="h-4 w-4 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
          <div className="text-3xl font-bold">{viewsSummary?.total_views ?? stats.contact_views ?? 0}</div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-muted/50 px-2.5 py-2">
              <p className="text-[11px] text-muted-foreground">Viewers</p>
              <p className="text-sm font-semibold">{viewsSummary?.unique_viewers ?? "—"}</p>
            </div>
            <div className="rounded-lg bg-muted/50 px-2.5 py-2">
              <p className="text-[11px] text-muted-foreground">Viewed</p>
              <p className="text-sm font-semibold">{viewsSummary?.unique_viewed ?? "—"}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</p>
        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/dashboard/farmnport/users", icon: Users, label: "View Users" },
            { href: "/dashboard/farmnport/agrochemicals", icon: Package, label: "Agrochemicals" },
            { href: "/dashboard/farmnport/feed-products", icon: Package, label: "Feed Products" },
            { href: "/dashboard/farmnport/prices", icon: CreditCard, label: "Manage Prices" },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-lg border bg-card p-3 text-card-foreground hover:bg-accent transition-colors"
            >
              <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium flex-1">{label}</span>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
