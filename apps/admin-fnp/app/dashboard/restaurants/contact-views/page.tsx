"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Phone, Mail, MessageCircle, MapPin, Navigation, MousePointerClick } from "lucide-react"

import { queryMenusContactViewStats, queryMenusContactViewList } from "@/lib/query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"

type ViewMode = "stats" | "list"

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
  directions: number
  last_event: string
}

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

  return (
    <div className="flex items-center gap-1 mt-4 justify-center">
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={i} className="px-2 text-sm text-muted-foreground">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p as number)}
            className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
              p === page
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground"
            }`}
          >
            {p}
          </button>
        )
      )}
    </div>
  )
}

export default function ContactViewsPage() {
  const [view, setView] = useState<ViewMode>("stats")
  const [statsPage, setStatsPage] = useState(1)
  const [listPage, setListPage] = useState(1)

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["menus-contact-view-stats", statsPage],
    queryFn: () => queryMenusContactViewStats(statsPage),
    refetchOnWindowFocus: false,
  })

  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ["menus-contact-view-list", listPage],
    queryFn: () => queryMenusContactViewList({ p: listPage }),
    enabled: view === "list",
    refetchOnWindowFocus: false,
  })

  const statsTotal: number = statsData?.data?.total ?? 0
  const statsRows: StatRow[] = statsData?.data?.data ?? []
  const listTotal: number = listData?.data?.total ?? 0
  const listRows: EventRow[] = listData?.data?.data ?? []

  const statsPageCount = Math.ceil(statsTotal / 20)
  const listPageCount = Math.ceil(listTotal / 10)

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Contact Interactions"
        text="Track how customers interact with location contact details."
      />

      {/* View Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setView("stats")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            view === "stats" ? "bg-primary text-primary-foreground" : "border hover:bg-muted"
          }`}
        >
          By Location
        </button>
        <button
          onClick={() => setView("list")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            view === "list" ? "bg-primary text-primary-foreground" : "border hover:bg-muted"
          }`}
        >
          Event Log
        </button>
      </div>

      {view === "stats" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {statsLoading ? <Skeleton className="h-4 w-24" /> : `${statsTotal} locations with interactions`}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {statsLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : statsRows.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs text-muted-foreground">
                        <th className="px-4 py-2 font-medium">Location</th>
                        <th className="px-4 py-2 font-medium text-right">Total</th>
                        <th className="px-4 py-2 font-medium text-right" title="Phone reveals"><Phone className="h-3.5 w-3.5 inline" /></th>
                        <th className="px-4 py-2 font-medium text-right" title="Phone clicks"><MousePointerClick className="h-3.5 w-3.5 inline" /></th>
                        <th className="px-4 py-2 font-medium text-right" title="WhatsApp"><MessageCircle className="h-3.5 w-3.5 inline" /></th>
                        <th className="px-4 py-2 font-medium text-right" title="Email"><Mail className="h-3.5 w-3.5 inline" /></th>
                        <th className="px-4 py-2 font-medium text-right" title="Address"><MapPin className="h-3.5 w-3.5 inline" /></th>
                        <th className="px-4 py-2 font-medium text-right" title="Directions"><Navigation className="h-3.5 w-3.5 inline" /></th>
                        <th className="px-4 py-2 font-medium">Last Event</th>
                      </tr>
                    </thead>
                    <tbody>
                      {statsRows.map((row) => (
                        <tr key={row._id} className="border-b last:border-0 hover:bg-muted/50">
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
                          <td className="px-4 py-2 text-xs text-muted-foreground whitespace-nowrap">{formatDate(row.last_event)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
          <Pagination page={statsPage} pageCount={statsPageCount} onPage={setStatsPage} />
        </>
      )}

      {view === "list" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {listLoading ? <Skeleton className="h-4 w-24" /> : `${listTotal} events`}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {listLoading ? (
                <div className="p-4 space-y-3">
                  {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : listRows.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No events yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs text-muted-foreground">
                        <th className="px-4 py-2 font-medium">Location</th>
                        <th className="px-4 py-2 font-medium">Type</th>
                        <th className="px-4 py-2 font-medium">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listRows.map((row) => (
                        <tr key={row._id} className="border-b last:border-0 hover:bg-muted/50">
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
          <Pagination page={listPage} pageCount={listPageCount} onPage={setListPage} />
        </>
      )}
    </DashboardShell>
  )
}
