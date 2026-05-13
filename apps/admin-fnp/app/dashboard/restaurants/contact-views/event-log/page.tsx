"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Phone, Mail, MessageCircle, MapPin, Navigation, MousePointerClick, QrCode } from "lucide-react"

import { queryMenusContactViewList } from "@/lib/query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"

interface EventRow {
  _id: string
  location_id: string
  location_name: string
  restaurant_name: string
  city: string
  type: string
  created: string
}

const TYPE_ICON: Record<string, React.ReactNode> = {
  phone: <Phone className="h-3.5 w-3.5" />,
  phone_click: <MousePointerClick className="h-3.5 w-3.5" />,
  email: <Mail className="h-3.5 w-3.5" />,
  whatsapp: <MessageCircle className="h-3.5 w-3.5" />,
  address: <MapPin className="h-3.5 w-3.5" />,
  directions: <Navigation className="h-3.5 w-3.5" />,
  qr_scan: <QrCode className="h-3.5 w-3.5" />,
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
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-muted-foreground">…</span>
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

export default function EventLogPage() {
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["menus-contact-view-list", page],
    queryFn: () => queryMenusContactViewList({ p: page }),
    refetchOnWindowFocus: false,
  })

  const total: number = data?.data?.total ?? 0
  const rows: EventRow[] = data?.data?.data ?? []
  const pageCount = Math.ceil(total / 10)

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Event Log"
        text="Raw log of every contact interaction event."
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            {isLoading ? <Skeleton className="h-4 w-24" /> : `${total} events`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No events yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="px-4 py-2 font-medium">Location</th>
                    <th className="px-4 py-2 font-medium">Type</th>
                    <th className="px-4 py-2 font-medium">When</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row._id} className="hover:bg-muted/50">
                      <td className="px-4 py-2">
                        <p className="font-medium capitalize">{row.location_name || "—"}</p>
                        <p className="text-xs text-muted-foreground capitalize">{row.restaurant_name} · {row.city}</p>
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                          {TYPE_ICON[row.type]}
                          {row.type}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs text-muted-foreground whitespace-nowrap">{formatDate(row.created)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <Pagination page={page} pageCount={pageCount} onPage={setPage} />
    </DashboardShell>
  )
}
