"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { queryMenusReservations } from "@/lib/query"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  seated:    "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  no_show:   "bg-zinc-100 text-zinc-700",
}

export default function ReservationsPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["menus-reservations", { status: statusFilter, p: page }],
    queryFn: () => queryMenusReservations({
      status: statusFilter === "all" ? undefined : statusFilter,
      p: page,
    }),
    refetchOnWindowFocus: false,
  })

  const reservations = data?.data?.reservations ?? []
  const total: number = data?.data?.total ?? 0
  const pageSize = 20
  const totalPages = Math.ceil(total / pageSize)

  return (
    <DashboardShell>
      <DashboardHeader heading="Table Reservations" text="Manage reservation requests from menus.co.zw." />

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
            <SelectItem value="seated">Seated</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="no_show">No show</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3].map(n => <div key={n} className="h-14 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : reservations.length === 0 ? (
        <div className="rounded-lg border p-12 text-center text-sm text-muted-foreground">
          No reservations found
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Ref</th>
                <th className="px-4 py-3 text-left font-medium">Restaurant</th>
                <th className="px-4 py-3 text-left font-medium">Guest</th>
                <th className="px-4 py-3 text-left font-medium">Date &amp; Time</th>
                <th className="px-4 py-3 text-left font-medium">Guests</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Submitted</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {reservations.map((r: any) => (
                <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs">{r.reservation_ref}</td>
                  <td className="px-4 py-3 capitalize">{r.restaurant_name}</td>
                  <td className="px-4 py-3">{r.full_name}</td>
                  <td className="px-4 py-3">{r.date} {r.preferred_time}</td>
                  <td className="px-4 py-3">{r.number_of_guests}</td>
                  <td className="px-4 py-3">
                    <Badge className={STATUS_COLORS[r.status] ?? ""} variant="outline">
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {format(new Date(r.created), "dd MMM, HH:mm")}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/dashboard/restaurants/reservations/${r.id}`)}
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{total} reservations total</span>
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
