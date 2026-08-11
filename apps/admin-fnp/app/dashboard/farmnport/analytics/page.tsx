"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Eye, Users, UserCheck, TrendingUp } from "lucide-react"

import { queryContactViewsStats } from "@/lib/query"
import { formatDate } from "@/lib/utilities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

function StatCard({ title, value, icon: Icon, subtitle }: { title: string; value: string | number; icon: any; subtitle?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

function ViewTable({ title, subtitle, items, idKey, countLabel, linkPrefix }: {
  title: string
  subtitle: string
  items: any[]
  idKey: string
  countLabel: string
  linkPrefix: string
}) {
  if (items.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="grid grid-cols-[2rem_1fr_5rem_6rem_3.5rem] gap-2 text-xs font-medium text-muted-foreground pb-1 border-b">
            <span>#</span>
            <span>Name</span>
            <span>City</span>
            <span>Last</span>
            <span className="text-right">{countLabel}</span>
          </div>
          {items.map((item: any, i: number) => (
            <Link
              key={item[idKey] || i}
              href={`/dashboard/farmnport/contact-views/${linkPrefix}/${item[idKey]}`}
              className="grid grid-cols-[2rem_1fr_5rem_6rem_3.5rem] gap-2 items-center rounded-lg p-2 text-sm hover:bg-muted/50 transition-colors"
            >
              <span className="text-muted-foreground text-xs">{i + 1}</span>
              <span className="font-medium truncate capitalize">{item.name}</span>
              <span className="text-xs text-muted-foreground truncate capitalize">{item.city || "—"}</span>
              <span className="text-xs text-muted-foreground">{formatDate(item.last_date) || "—"}</span>
              <span className="text-right font-semibold">{item.view_count ?? item.contacts_viewed}</span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AnalyticsPage() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["contact-views-stats"],
    queryFn: () => queryContactViewsStats(),
    refetchOnWindowFocus: false,
  })

  const stats = statsData?.data

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
              <CardContent><Skeleton className="h-7 w-16" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const summary = stats?.summary
  const topViewed = stats?.top_viewed ?? []
  const topViewers = stats?.top_viewers ?? []
  const viewsByType = stats?.views_by_type ?? []

  // Split by type
  const viewedFarmers = topViewed.filter((c: any) => c.type === "farmer")
  const viewedBuyers = topViewed.filter((c: any) => c.type === "buyer")
  const activeFarmers = topViewers.filter((v: any) => v.type === "farmer")
  const activeBuyers = topViewers.filter((v: any) => v.type === "buyer")

  // Only farmer + buyer counts
  const farmerViews = viewsByType.find((v: any) => v.type === "farmer")?.count ?? 0
  const buyerViews = viewsByType.find((v: any) => v.type === "buyer")?.count ?? 0
  const totalViews = farmerViews + buyerViews

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">Platform activity and engagement overview</p>
      </div>

      {/* Key Numbers */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Contact Views" value={summary?.total_views ?? 0} icon={Eye} subtitle="All-time contact reveals" />
        <StatCard title="Unique Viewers" value={summary?.unique_viewers ?? 0} icon={Users} subtitle="People who viewed contacts" />
        <StatCard title="Profiles Viewed" value={summary?.unique_viewed ?? 0} icon={UserCheck} subtitle="Unique contacts viewed" />
        <StatCard title="Avg Views Per Profile" value={summary?.avg_views_per_profile?.toFixed(1) ?? "0"} icon={TrendingUp} subtitle="Average views per contact" />
      </div>

      {/* Farmer vs Buyer split */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Buyer profiles viewed</p>
            <p className="text-xs text-muted-foreground">{totalViews > 0 ? ((buyerViews / totalViews) * 100).toFixed(0) : 0}% of views</p>
          </div>
          <span className="text-lg font-bold">{buyerViews}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Farmer profiles viewed</p>
            <p className="text-xs text-muted-foreground">{totalViews > 0 ? ((farmerViews / totalViews) * 100).toFixed(0) : 0}% of views</p>
          </div>
          <span className="text-lg font-bold">{farmerViews}</span>
        </div>
      </div>

      {/* Most Viewed Farmers */}
      <ViewTable
        title="Most Viewed Farmers"
        subtitle="Farmer profiles being viewed by buyers and other farmers"
        items={viewedFarmers}
        idKey="viewed_id"
        countLabel="Views"
        linkPrefix="contact"
      />

      {/* Most Viewed Buyers */}
      <ViewTable
        title="Most Viewed Buyers"
        subtitle="Buyer profiles being viewed by farmers and other buyers"
        items={viewedBuyers}
        idKey="viewed_id"
        countLabel="Views"
        linkPrefix="contact"
      />

      {/* Most Active Farmers */}
      <ViewTable
        title="Most Active Farmers"
        subtitle="Farmers who are actively looking at other profiles"
        items={activeFarmers}
        idKey="user_id"
        countLabel="Viewed"
        linkPrefix="viewer"
      />

      {/* Most Active Buyers */}
      <ViewTable
        title="Most Active Buyers"
        subtitle="Buyers who are actively sourcing from the platform"
        items={activeBuyers}
        idKey="user_id"
        countLabel="Viewed"
        linkPrefix="viewer"
      />
    </div>
  )
}
