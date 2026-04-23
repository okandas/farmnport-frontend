"use client"

import Link from "next/link"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Phone, Mail, MessageCircle, MapPin, Navigation,
  MousePointerClick, Eye, ArrowRight, ArrowLeft,
  UtensilsCrossed,
} from "lucide-react"

import {
  queryMenusContactViewStats,
  queryMenusContactViewList,
  queryRestaurants,
  queryRestaurantLocations,
} from "@/lib/query"
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
  return new Date(s).toLocaleString()
}

export default function RestaurantsPage() {
  const [view, setView] = useState<ViewMode>("stats")
  const [statsPage, setStatsPage] = useState(1)
  const [listPage, setListPage] = useState(1)

  const { data: contactData } = useQuery({
    queryKey: ["menus-contact-view-stats"],
    queryFn: () => queryMenusContactViewStats(),
    refetchOnWindowFocus: false,
  })

  const { data: restaurantsData } = useQuery({
    queryKey: ["restaurants-list"],
    queryFn: () => queryRestaurants({ limit: 1 }),
    refetchOnWindowFocus: false,
  })

  const { data: locationsData } = useQuery({
    queryKey: ["restaurant-locations-list"],
    queryFn: () => queryRestaurantLocations(),
    refetchOnWindowFocus: false,
  })

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

  const contactTotal: number = contactData?.data?.total ?? 0
  const restaurantCount: number = restaurantsData?.data?.total ?? 0
  const locationCount: number = locationsData?.data?.total ?? 0

  const statsTotal: number = statsData?.data?.total ?? 0
  const statsRows: StatRow[] = statsData?.data?.data ?? []
  const listTotal: number = listData?.data?.total ?? 0
  const listRows: EventRow[] = listData?.data?.data ?? []

  const statsPageCount = Math.ceil(statsTotal / 20)
  const listPageCount = Math.ceil(listTotal / 50)

  return (
    <DashboardShell>
      <DashboardHeader heading="Overview" text="Restaurants and menus at a glance." />

      {/* Quick Actions */}
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4 mb-2">
        <Link
          href="/dashboard/restaurants/all"
          className="flex items-center gap-3 rounded-lg border bg-card p-3 text-card-foreground shadow-sm hover:bg-accent transition-colors"
        >
          <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium flex-1">Restaurants</span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>
        <Link
          href="/dashboard/restaurants/locations"
          className="flex items-center gap-3 rounded-lg border bg-card p-3 text-card-foreground shadow-sm hover:bg-accent transition-colors"
        >
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium flex-1">Locations</span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>
        <Link
          href="/dashboard/menus/contact-views"
          className="flex items-center gap-3 rounded-lg border bg-card p-3 text-card-foreground shadow-sm hover:bg-accent transition-colors"
        >
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium flex-1">Contact Interactions</span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Restaurants</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{restaurantCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locations</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{locationCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contact Interactions</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactTotal}</div>
            <p className="text-xs text-muted-foreground">Across all locations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Locations</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/menus/contact-views" className="text-sm text-emerald-600 hover:underline">
              View stats →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Analytics */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Contact Interactions</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setView("stats")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                view === "stats" ? "bg-primary text-primary-foreground" : "border hover:bg-muted"
              }`}
            >
              By Location
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                view === "list" ? "bg-primary text-primary-foreground" : "border hover:bg-muted"
              }`}
            >
              Event Log
            </button>
          </div>
        </div>

        {view === "stats" && (
          <>
            <Card>
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
            {statsPageCount > 1 && (
              <div className="flex items-center justify-between mt-4">
                <button
                  disabled={statsPage <= 1}
                  onClick={() => setStatsPage((p) => p - 1)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="h-4 w-4" /> Prev
                </button>
                <span className="text-sm text-muted-foreground">Page {statsPage} of {statsPageCount}</span>
                <button
                  disabled={statsPage >= statsPageCount}
                  onClick={() => setStatsPage((p) => p + 1)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}

        {view === "list" && (
          <>
            <Card>
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
            {listPageCount > 1 && (
              <div className="flex items-center justify-between mt-4">
                <button
                  disabled={listPage <= 1}
                  onClick={() => setListPage((p) => p - 1)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="h-4 w-4" /> Prev
                </button>
                <span className="text-sm text-muted-foreground">Page {listPage} of {listPageCount}</span>
                <button
                  disabled={listPage >= listPageCount}
                  onClick={() => setListPage((p) => p + 1)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardShell>
  )
}
