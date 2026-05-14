"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { queryMenusOrders } from "@/lib/query"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const STATUS_COLORS: Record<string, string> = {
  pending:          "bg-yellow-100 text-yellow-800",
  confirmed:        "bg-blue-100 text-blue-800",
  preparing:        "bg-purple-100 text-purple-800",
  ready:            "bg-teal-100 text-teal-800",
  out_for_delivery: "bg-indigo-100 text-indigo-800",
  delivered:        "bg-green-100 text-green-800",
  completed:        "bg-green-100 text-green-800",
  cancelled:        "bg-red-100 text-red-800",
}

const TYPE_LABELS: Record<string, string> = {
  pickup:   "Pickup",
  delivery: "Delivery",
  dine_in:  "Dine-in",
}

export default function MenusOrdersPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["menus-orders", { status: statusFilter, type: typeFilter, p: page }],
    queryFn: () => queryMenusOrders({
      status: statusFilter === "all" ? undefined : statusFilter,
      type: typeFilter === "all" ? undefined : typeFilter,
      p: page,
    }),
    refetchOnWindowFocus: false,
  })

  const orders = data?.data?.orders ?? []
  const total: number = data?.data?.total ?? 0
  const pageSize = 20
  const totalPages = Math.ceil(total / pageSize)

  return (
    <DashboardShell>
      <DashboardHeader heading="Food Orders" text="Manage orders placed through menus.co.zw." />

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="out_for_delivery">Out for delivery</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1) }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="pickup">Pickup</SelectItem>
            <SelectItem value="delivery">Delivery</SelectItem>
            <SelectItem value="dine_in">Dine-in</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3].map(n => <div key={n} className="h-14 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border p-12 text-center text-sm text-muted-foreground">
          No orders found
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Ref</th>
                <th className="px-4 py-3 text-left font-medium">Restaurant</th>
                <th className="px-4 py-3 text-left font-medium">Customer</th>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Total</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{order.order_ref}</td>
                  <td className="px-4 py-3 capitalize">{order.restaurant_name}</td>
                  <td className="px-4 py-3">{order.full_name}</td>
                  <td className="px-4 py-3">{TYPE_LABELS[order.type] ?? order.type}</td>
                  <td className="px-4 py-3">${((order.total ?? 0) / 100).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <Badge className={STATUS_COLORS[order.status] ?? ""} variant="outline">
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {format(new Date(order.created), "dd MMM, HH:mm")}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/dashboard/restaurants/menus-orders/${order.id}`)}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{total} orders total</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1}>Previous</Button>
            <span className="flex items-center px-2">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>Next</Button>
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
