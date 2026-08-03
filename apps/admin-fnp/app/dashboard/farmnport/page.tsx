"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { queryDashboardStats, queryContactViewsStats, querySalesStats } from "@/lib/query"
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
  contact_views: number
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <Link href={href} className="group flex items-center justify-between mb-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider group-hover:text-foreground transition-colors">{title}</p>
      <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-0.5">
        View <ChevronRight className="h-3 w-3" />
      </span>
    </Link>
  )
}

function ClickableCard({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link href={href} className="rounded-xl border bg-card p-5 hover:border-foreground/20 hover:shadow-sm transition-all block">
      {children}
    </Link>
  )
}

function QuickLink({
  href,
  label,
  count,
}: {
  href: string
  label: string
  count?: number | string
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 hover:border-foreground/20 hover:shadow-sm transition-all"
    >
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-2">
        {count != null && (
          <span className="text-xs text-muted-foreground">{count}</span>
        )}
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  )
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

  const { data: salesData } = useQuery({
    queryKey: ["admin-sales-stats"],
    queryFn: () => querySalesStats(),
    refetchOnWindowFocus: false,
  })

  const stats: DashboardStats | undefined = data?.data
  const viewsSummary = viewsData?.data?.summary
  const salesStats = salesData?.data

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

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Platform overview</p>
      </div>

      {/* ── Users & Engagement ── */}
      <div>
        <SectionHeader title="Users & Engagement" href="/dashboard/farmnport/users" />
        <div className="grid gap-4 md:grid-cols-3">

          <ClickableCard href="/dashboard/farmnport/users">
            <span className="text-sm font-medium text-muted-foreground">Total Users</span>
            <div className="text-3xl font-bold mt-1">{stats.users.total}</div>
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
          </ClickableCard>

          <ClickableCard href="/dashboard/farmnport/analytics">
            <span className="text-sm font-medium text-muted-foreground">Contact Views</span>
            <div className="text-3xl font-bold mt-1">{viewsSummary?.total_views ?? stats.contact_views ?? 0}</div>
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
          </ClickableCard>

          <ClickableCard href="/dashboard/farmnport/brands">
            <span className="text-sm font-medium text-muted-foreground">Brands</span>
            <div className="text-3xl font-bold mt-1">{stats.brands}</div>
            <p className="text-xs text-muted-foreground mt-1">Registered brands</p>
          </ClickableCard>

        </div>
      </div>

      {/* ── Sales & Orders ── */}
      <div>
        <SectionHeader title="Sales & Orders" href="/dashboard/farmnport/orders/sales" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          <ClickableCard href="/dashboard/farmnport/orders/sales">
            <span className="text-sm font-medium text-muted-foreground">Total Orders</span>
            <div className="text-3xl font-bold mt-1">{salesStats?.orders?.total ?? "—"}</div>
            <p className="text-xs text-muted-foreground mt-1">Excluding cancelled</p>
          </ClickableCard>

          <ClickableCard href="/dashboard/farmnport/sales">
            <span className="text-sm font-medium text-muted-foreground">Revenue</span>
            <div className="text-3xl font-bold mt-1">
              {salesStats?.revenue?.all_time != null
                ? `$${(salesStats.revenue.all_time / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "—"}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-muted/50 px-2 py-1.5">
                <p className="text-[10px] text-muted-foreground">Today</p>
                <p className="text-xs font-semibold">
                  {salesStats?.revenue?.today != null ? `$${(salesStats.revenue.today / 100).toFixed(2)}` : "—"}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 px-2 py-1.5">
                <p className="text-[10px] text-muted-foreground">This week</p>
                <p className="text-xs font-semibold">
                  {salesStats?.revenue?.week != null ? `$${(salesStats.revenue.week / 100).toFixed(2)}` : "—"}
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 px-2 py-1.5">
                <p className="text-[10px] text-muted-foreground">This month</p>
                <p className="text-xs font-semibold">
                  {salesStats?.revenue?.month != null ? `$${(salesStats.revenue.month / 100).toFixed(2)}` : "—"}
                </p>
              </div>
            </div>
          </ClickableCard>

          <ClickableCard href="/dashboard/farmnport/orders/sales">
            <span className="text-sm font-medium text-muted-foreground">Needs Attention</span>
            <div className="text-3xl font-bold mt-1">
              {salesStats?.orders != null
                ? (salesStats.orders.pending ?? 0) + (salesStats.orders.paid ?? 0)
                : "—"}
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium">{salesStats?.orders?.pending ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-medium">{salesStats?.orders?.paid ?? "—"}</span>
              </div>
            </div>
          </ClickableCard>

          <ClickableCard href="/dashboard/farmnport/orders/sales">
            <span className="text-sm font-medium text-muted-foreground">Fulfilled</span>
            <div className="text-3xl font-bold mt-1">
              {salesStats?.orders != null
                ? (salesStats.orders.delivered ?? 0) + (salesStats.orders.collected ?? 0)
                : "—"}
            </div>
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Delivered</span>
                <span className="font-medium">{salesStats?.orders?.delivered ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Collected</span>
                <span className="font-medium">{salesStats?.orders?.collected ?? "—"}</span>
              </div>
            </div>
          </ClickableCard>

        </div>

        {/* Sales quick links */}
        <div className="grid gap-2 md:grid-cols-4 mt-3">
          <QuickLink href="/dashboard/farmnport/orders/bookings" label="Bookings" />
          <QuickLink href="/dashboard/farmnport/orders/booking-preorders" label="Pre-Orders" />
          <QuickLink href="/dashboard/farmnport/lots" label="Lots" />
          <QuickLink href="/dashboard/farmnport/documents" label="Documents" />
        </div>
      </div>

      {/* ── Products ── */}
      <div>
        <SectionHeader title="Products" href="/dashboard/farmnport/agrochemicals" />
        <div className="grid gap-4 md:grid-cols-3">

          <ClickableCard href="/dashboard/farmnport/agrochemicals">
            <span className="text-sm font-medium text-muted-foreground">AgroChemicals</span>
            <div className="text-3xl font-bold mt-1">{stats.products.agro_chemicals}</div>
            <p className="text-xs text-muted-foreground mt-1">Products</p>
          </ClickableCard>

          <ClickableCard href="/dashboard/farmnport/animal-health-products">
            <span className="text-sm font-medium text-muted-foreground">Animal Health</span>
            <div className="text-3xl font-bold mt-1">{stats.products.animal_health}</div>
            <p className="text-xs text-muted-foreground mt-1">Products</p>
          </ClickableCard>

          <ClickableCard href="/dashboard/farmnport/feed-products">
            <span className="text-sm font-medium text-muted-foreground">Feed</span>
            <div className="text-3xl font-bold mt-1">{stats.products.feed}</div>
            <p className="text-xs text-muted-foreground mt-1">Products</p>
          </ClickableCard>

        </div>

        {/* Product quick links */}
        <div className="grid gap-2 md:grid-cols-4 mt-3">
          <QuickLink href="/dashboard/farmnport/agrochemical-categories" label="Agro Categories" />
          <QuickLink href="/dashboard/farmnport/agrochemical-active-ingredients" label="Agro Ingredients" />
          <QuickLink href="/dashboard/farmnport/agrochemical-targets" label="Agro Targets" />
          <QuickLink href="/dashboard/farmnport/animal-health-categories" label="Animal Categories" />
          <QuickLink href="/dashboard/farmnport/feed-categories" label="Feed Categories" />
          <QuickLink href="/dashboard/farmnport/feed-active-ingredients" label="Feed Ingredients" />
          <QuickLink href="/dashboard/farmnport/feed-nutritional-specs" label="Nutritional Specs" />
          <QuickLink href="/dashboard/farmnport/equipment" label="Equipment" />
        </div>
      </div>

      {/* ── Farm Produce & Programs ── */}
      <div>
        <SectionHeader title="Farm Produce & Programs" href="/dashboard/farmnport/farmproduce" />
        <div className="grid gap-2 md:grid-cols-4">
          <QuickLink href="/dashboard/farmnport/farmproduce" label="Produce" />
          <QuickLink href="/dashboard/farmnport/farmproducecategories" label="Produce Categories" />
          <QuickLink href="/dashboard/farmnport/seed-products" label="Seed Products" />
          <QuickLink href="/dashboard/farmnport/breeds" label="Breeds" />
          <QuickLink href="/dashboard/farmnport/crop-groups" label="Crop Groups" />
          <QuickLink href="/dashboard/farmnport/weed-groups" label="Weed Groups" />
          <QuickLink href="/dashboard/farmnport/spray-programs" label="Spray Programs" count={stats.guides.spray_programs} />
          <QuickLink href="/dashboard/farmnport/feeding-programs" label="Feeding Programs" count={stats.guides.feeding_programs} />
        </div>
      </div>

      {/* ── Communications ── */}
      <div>
        <SectionHeader title="Communications" href="/dashboard/farmnport/blast" />
        <div className="grid gap-2 md:grid-cols-4">
          <QuickLink href="/dashboard/farmnport/blast" label="New Blast" />
          <QuickLink href="/dashboard/farmnport/blast/sent" label="Sent Blasts" />
          <QuickLink href="/dashboard/farmnport/buyer-contacts" label="Buyer Contacts" />
          <QuickLink href="/dashboard/farmnport/prices/series" label="Price Series" />
        </div>
      </div>

    </div>
  )
}
