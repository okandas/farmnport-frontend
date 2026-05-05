"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState, ColumnDef, createColumnHelper } from "@tanstack/react-table"
import Link from "next/link"
import { Phone, Clock, Navigation } from "lucide-react"

import { queryDeliveryLocations } from "@/lib/query"
import { DataTable } from "@/components/structures/data-table"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"

type DeliveryLocation = {
  id: string
  name: string
  address: string
  city: string
  time_slots: string[]
  phones: string[]
  latitude: number
  longitude: number
  active: boolean
}

const columnHelper = createColumnHelper<DeliveryLocation>()

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/farmnport/orders/delivery-locations/${row.original.id}/edit`}
        className="font-medium hover:text-primary transition-colors"
      >
        {row.getValue("name")}
      </Link>
    ),
  }),
  columnHelper.accessor("address", {
    header: "Address",
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue("address")}, {row.original.city}</span>
    ),
  }),
  columnHelper.accessor("time_slots", {
    header: "Time Slots",
    cell: ({ row }) => {
      const slots = row.getValue("time_slots") as string[]
      return (
        <div className="flex flex-wrap gap-1">
          {slots?.length ? slots.map((s) => (
            <span key={s} className="inline-flex items-center gap-1 text-xs border rounded px-2 py-0.5 text-muted-foreground">
              <Clock className="w-3 h-3" />{s}
            </span>
          )) : <span className="text-muted-foreground text-xs">—</span>}
        </div>
      )
    },
  }),
  columnHelper.accessor("phones", {
    header: "Contact",
    cell: ({ row }) => {
      const phones = row.getValue("phones") as string[]
      return (
        <div className="space-y-0.5">
          {phones?.length ? phones.map((p) => (
            <a key={p} href={`tel:${p}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
              <Phone className="w-3 h-3" />{p}
            </a>
          )) : <span className="text-muted-foreground text-xs">—</span>}
        </div>
      )
    },
  }),
  columnHelper.accessor("latitude", {
    header: "Directions",
    cell: ({ row }) => {
      const lat = row.original.latitude
      const lng = row.original.longitude
      if (!lat || !lng) return <span className="text-xs text-muted-foreground">—</span>
      return (
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <Navigation className="w-3.5 h-3.5" /> Directions
        </a>
      )
    },
  }),
  columnHelper.accessor("active", {
    header: "Status",
    cell: ({ row }) => {
      const active = row.getValue("active") as boolean
      return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${active ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>
          {active ? "Active" : "Inactive"}
        </span>
      )
    },
  }),
] as ColumnDef<DeliveryLocation>[]

const PAGE_SIZE = 20

export default function DeliveryLocationsPage() {
  const [search, setSearch] = useState("")
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })

  const { data } = useQuery({
    queryKey: ["admin-delivery-locations"],
    queryFn: () => queryDeliveryLocations(),
    refetchOnWindowFocus: false,
  })

  const locations: DeliveryLocation[] = data?.data?.locations ?? []
  const total: number = locations.length

  return (
    <DashboardShell>
      <DashboardHeader heading="Delivery Locations" text="Manage drop-off hubs for farmer deliveries." />
      <DataTable
        columns={columns}
        data={locations}
        tableName="Location"
        newUrl="/dashboard/farmnport/orders/delivery-locations/new"
        total={total}
        pagination={pagination}
        setPagination={setPagination}
        search={search}
        setSearch={setSearch}
        searchPlaceholder="Search locations..."
      />
    </DashboardShell>
  )
}
