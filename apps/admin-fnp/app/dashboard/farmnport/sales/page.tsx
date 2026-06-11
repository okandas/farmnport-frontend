"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import {
  TrendingUp,
  ShoppingCart,
  Clock,
  CheckCircle2,
  Package,
  ArrowRight,
} from "lucide-react"

import { querySalesStats, queryOrders } from "@/lib/query"
import { orderDetailHref } from "@/components/structures/columns/orders"
import { centsToDollars, formatDate } from "@/lib/utilities"
import { Skeleton } from "@/components/ui/skeleton"

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  paid: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  processing: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  dispatched: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  ready: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  collected: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
}

interface SalesStats {
  revenue: { today: number; week: number; month: number; all_time: number }
  orders: {
    pending: number
    paid: number
    processing: number
    delivered: number
    collected?: number
    total: number
  }
}

interface Order {
  id: string
  order_number: string
  client_name: string
  status: string
  total: number
  order_type: string
  created: string
}

export default function SalesOverviewPage() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["sales-stats"],
    queryFn: () => querySalesStats(undefined),
    refetchOnWindowFocus: false,
  })

  const { data: recentData, isLoading: recentLoading } = useQuery({
    queryKey: ["recent-orders"],
    queryFn: () => queryOrders({ limit: 10 }),
    refetchOnWindowFocus: false,
  })

  const stats: SalesStats | undefined = statsData?.data
  const recentOrders: Order[] = recentData?.data?.orders ?? []

  if (statsLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-36" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const needsAttention = stats ? (stats.orders.pending ?? 0) + (stats.orders.paid ?? 0) : 0
  const fulfilled = stats ? (stats.orders.delivered ?? 0) + (stats.orders.collected ?? 0) : 0

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sales</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Revenue and order overview</p>
        </div>
        <Link
          href="/dashboard/farmnport/sales/orders"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          All orders
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {stats && (
        <>
          {/* Top row: Revenue + Order status */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            {/* All-time revenue */}
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">All Time Revenue</span>
                <div className="h-8 w-8 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="text-3xl font-bold">{centsToDollars(stats.revenue.all_time)}</div>
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                <div className="rounded-lg bg-muted/50 px-2 py-1.5">
                  <p className="text-[10px] text-muted-foreground">Today</p>
                  <p className="text-xs font-semibold">{centsToDollars(stats.revenue.today)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 px-2 py-1.5">
                  <p className="text-[10px] text-muted-foreground">This week</p>
                  <p className="text-xs font-semibold">{centsToDollars(stats.revenue.week)}</p>
                </div>
                <div className="rounded-lg bg-muted/50 px-2 py-1.5">
                  <p className="text-[10px] text-muted-foreground">This month</p>
                  <p className="text-xs font-semibold">{centsToDollars(stats.revenue.month)}</p>
                </div>
              </div>
            </div>

            {/* Total orders */}
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Total Orders</span>
                <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
              <div className="text-3xl font-bold">{stats.orders.total}</div>
              <p className="text-xs text-muted-foreground mt-1">Excluding cancelled</p>
            </div>

            {/* Needs attention */}
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Needs Attention</span>
                <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="text-3xl font-bold">{needsAttention}</div>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-medium">{stats.orders.pending}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Paid</span>
                  <span className="font-medium">{stats.orders.paid}</span>
                </div>
              </div>
            </div>

            {/* Fulfilled */}
            <div className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Fulfilled</span>
                <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="text-3xl font-bold">{fulfilled}</div>
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Delivered</span>
                  <span className="font-medium">{stats.orders.delivered}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Collected</span>
                  <span className="font-medium">{stats.orders.collected ?? 0}</span>
                </div>
              </div>
            </div>

          </div>
        </>
      )}

      {/* Recent Orders */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Package className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
            </div>
            <span className="text-sm font-medium">Recent Orders</span>
          </div>
          <Link
            href="/dashboard/farmnport/sales/orders"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="divide-y">
          {recentLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-10 text-center">No orders yet</p>
          ) : (
            recentOrders.map((order) => (
              <Link
                key={order.id}
                href={orderDetailHref(order)}
                className="flex items-center justify-between px-5 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-sm font-medium">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">{order.client_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground hidden sm:block">
                    {formatDate(order.created)}
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {centsToDollars(order.total)}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize ${STATUS_COLORS[order.status] ?? "bg-muted text-muted-foreground"}`}>
                    {order.status}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

    </div>
  )
}
