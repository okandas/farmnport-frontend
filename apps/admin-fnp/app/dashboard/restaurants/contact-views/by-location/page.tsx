"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Phone, Mail, MessageCircle, MapPin, Navigation, MousePointerClick, QrCode } from "lucide-react"

import { queryMenusContactViewStats } from "@/lib/query"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"

interface StatRow {
  _id: string
  restaurant_name: string
  location_name: string
  city: string
  total: number
  phone: number
  phone_click: number
  email: number
  whatsapp: number
  address: number
  address_copy: number
  directions: number
  qr_scan: number
  last_event: string
}

function formatDate(s: string) {
  if (!s) return "—"
  return new Date(s).toLocaleString("en-GB")
}

function Pagination({ page, pageCount, onPage }: { page: number; pageCount: number; onPage: (p: number) => void }) {
  if (pageCount <= 1) return null
  const pages: (number | "...")[] = []
  if (pageCount <= 7) {
    for (let i = 1; i <= pageCount; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push("...")
    for (let i = Math.max(2, page - 1); i <= Math.min(pageCount - 1, page + 1); i++) pages.push(i)
    if (page < pageCount - 2) pages.push("...")
    pages.push(pageCount)
  }
  const handlePage = (p: number) => {
    onPage(p)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
  return (
    <div className="flex items-center gap-1 mt-4 justify-center">
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={i} className="px-2 text-sm text-muted-foreground">…</span>
        ) : (
          <button
            key={p}
            onClick={() => handlePage(p as number)}
            className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
              p === page ? "bg-primary text-primary-foreground" : "hover:bg-muted text-muted-foreground"
            }`}
          >
            {p}
          </button>
        )
      )}
    </div>
  )
}

export default function ByLocationPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["menus-contact-view-stats", page],
    queryFn: () => queryMenusContactViewStats(page),
    refetchOnWindowFocus: false,
  })

  const total: number = data?.data?.total ?? 0
  const rows: StatRow[] = data?.data?.data ?? []
  const pageCount = Math.ceil(total / 20)

  return (
    <DashboardShell>
      <DashboardHeader
        heading="By Location"
        text="Contact interaction totals broken down by restaurant location."
      />
      <div>
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="px-4 py-2 font-medium">Location</th>
                    <th className="px-4 py-2 font-medium text-right">Total</th>
                    <th className="px-4 py-2 font-medium text-right" title="Phone reveals"><Phone className="h-3.5 w-3.5 inline" /></th>
                    <th className="px-4 py-2 font-medium text-right" title="Phone clicks"><MousePointerClick className="h-3.5 w-3.5 inline" /></th>
                    <th className="px-4 py-2 font-medium text-right" title="WhatsApp"><MessageCircle className="h-3.5 w-3.5 inline" /></th>
                    <th className="px-4 py-2 font-medium text-right" title="Email"><Mail className="h-3.5 w-3.5 inline" /></th>
                    <th className="px-4 py-2 font-medium text-right" title="Address"><MapPin className="h-3.5 w-3.5 inline" /></th>
                    <th className="px-4 py-2 font-medium text-right" title="Directions"><Navigation className="h-3.5 w-3.5 inline" /></th>
                    <th className="px-4 py-2 font-medium text-right" title="QR Scan"><QrCode className="h-3.5 w-3.5 inline" /></th>
                    <th className="px-4 py-2 font-medium">Last Event</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row._id} className="hover:bg-muted/50">
                      <td className="px-4 py-2">
                        <p className="font-medium capitalize">{row.location_name || "—"}</p>
                        <p className="text-xs text-muted-foreground capitalize">{row.restaurant_name} · {row.city}</p>
                      </td>
                      <td className="px-4 py-2 text-right font-semibold">{row.total}</td>
                      <td className="px-4 py-2 text-right">{row.phone}</td>
                      <td className="px-4 py-2 text-right">{row.phone_click}</td>
                      <td className="px-4 py-2 text-right">{row.whatsapp}</td>
                      <td className="px-4 py-2 text-right">{row.email}</td>
                      <td className="px-4 py-2 text-right">{row.address}</td>
                      <td className="px-4 py-2 text-right">{row.directions}</td>
                      <td className="px-4 py-2 text-right">{row.qr_scan}</td>
                      <td className="px-4 py-2 text-xs text-muted-foreground whitespace-nowrap">{formatDate(row.last_event)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>
      <Pagination page={page} pageCount={pageCount} onPage={setPage} />
    </DashboardShell>
  )
}
