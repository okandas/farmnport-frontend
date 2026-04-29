"use client"

import Link from "next/link"
import { PaginationState } from "@tanstack/react-table"
import { CalendarDays, Truck } from "lucide-react"

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  approved:  "bg-purple-100 text-purple-800",
  ready:     "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
}

interface BookingsTableProps {
  bookings: any[]
  total: number
  pagination: PaginationState
  setPagination: (fn: (p: PaginationState) => PaginationState) => void
}

export function BookingsTable({ bookings, total, pagination, setPagination }: BookingsTableProps) {
  const pageCount = Math.ceil(total / pagination.pageSize)

  if (bookings.length === 0) {
    return (
      <div className="border rounded-xl py-16 text-center text-sm text-muted-foreground">
        No bookings found.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Ref</th>
              <th className="text-left px-4 py-3 font-medium">Type</th>
              <th className="text-left px-4 py-3 font-medium">Client</th>
              <th className="text-left px-4 py-3 font-medium">Details</th>
              <th className="text-left px-4 py-3 font-medium">Date</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <Link href={`/dashboard/farmnport/orders/bookings/${b.id}`} className="font-medium text-primary hover:underline">
                    {b.booking_ref}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-1.5 capitalize text-muted-foreground">
                    {b.type === "delivery" ? <Truck className="w-3.5 h-3.5" /> : <CalendarDays className="w-3.5 h-3.5" />}
                    {b.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium">{b.client_name}</p>
                  <p className="text-xs text-muted-foreground">{b.client_phone}</p>
                </td>
                <td className="px-4 py-3 max-w-[200px]">
                  {b.type === "livestock" && b.livestock && (
                    <p className="truncate text-xs">{b.livestock.event_title} · {b.livestock.quantity} units</p>
                  )}
                  {b.type === "delivery" && b.delivery && (
                    <p className="truncate text-xs">{b.delivery.delivery_location_name} · {b.delivery.goods}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(b.booking_date)}
                  {b.time_slot && <span className="block">{b.time_slot}</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[b.status] ?? "bg-muted text-muted-foreground"}`}>
                    {capitalize(b.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="flex justify-center gap-1">
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              onClick={() => setPagination((p) => ({ ...p, pageIndex: i }))}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                i === pagination.pageIndex
                  ? "bg-primary text-primary-foreground"
                  : "border hover:bg-muted"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
