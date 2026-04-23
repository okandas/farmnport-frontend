"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import {
  UtensilsCrossed,
  MapPin,
  Phone,
  Eye,
  ArrowRight,
  ClipboardList,
} from "lucide-react"

import { queryMenusContactViewStats, queryRestaurants, queryRestaurantLocations } from "@/lib/query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MenusDashboardPage() {
  const { data: contactData, isLoading: contactLoading } = useQuery({
    queryKey: ["menus-contact-view-stats"],
    queryFn: () => queryMenusContactViewStats(),
    refetchOnWindowFocus: false,
  })

  const { data: restaurantsData, isLoading: restaurantsLoading } = useQuery({
    queryKey: ["restaurants-list"],
    queryFn: () => queryRestaurants({ limit: 1 }),
    refetchOnWindowFocus: false,
  })

  const { data: locationsData, isLoading: locationsLoading } = useQuery({
    queryKey: ["restaurant-locations-list"],
    queryFn: () => queryRestaurantLocations(),
    refetchOnWindowFocus: false,
  })

  const contactTotal: number = contactData?.data?.total ?? 0
  const restaurantCount: number = restaurantsData?.data?.total ?? 0
  const locationCount: number = locationsData?.data?.total ?? 0

  const isLoading = contactLoading || restaurantsLoading || locationsLoading

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <Skeleton className="h-9 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Menus</h2>
        <p className="text-muted-foreground">Overview of menus.co.zw</p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/dashboard/restaurants/menus"
          className="flex items-center gap-3 rounded-lg border bg-card p-3 text-card-foreground shadow-sm hover:bg-accent transition-colors"
        >
          <ClipboardList className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium flex-1">Menus</span>
          <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
        </Link>
        <Link
          href="/dashboard/restaurants/menu-items"
          className="flex items-center gap-3 rounded-lg border bg-card p-3 text-card-foreground shadow-sm hover:bg-accent transition-colors"
        >
          <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium flex-1">Menu Items</span>
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

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <Link
              href="/dashboard/menus/contact-views"
              className="text-sm text-emerald-600 hover:underline"
            >
              View stats →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
