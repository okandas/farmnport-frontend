"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { TumiraCourierRateModal } from "@/components/structures/modals/tumira-courier-rate-modal"

export type WeightBand = {
  max_grams: number
  price_cents?: number
  rate_cents_per_km?: number
  min_price_cents?: number
}

export type RateBand = {
  max_metres: number
  price_cents: number
}

export type TumiraCourierRate = {
  id: string
  courier_name: string
  service_type: string
  pricing_model: string
  origin_label?: string
  origin_lat?: number
  origin_lng?: number
  origin_city_code?: string
  destination_city_code?: string
  origin_ward_code?: string
  destination_ward_code?: string
  weight_bands?: WeightBand[]
  bands?: RateBand[]
  active: boolean
  created: string
}

function ViewButton({ rate }: { rate: TumiraCourierRate }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>View</Button>
      <TumiraCourierRateModal rate={rate} open={open} onOpenChange={setOpen} />
    </>
  )
}

export const tumiraCourierRateColumns: ColumnDef<TumiraCourierRate>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "courier_name",
    header: "Courier",
  },
  {
    accessorKey: "service_type",
    header: "Service",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.service_type?.replace(/_/g, " ") || "—"}</span>
    ),
  },
  {
    accessorKey: "pricing_model",
    header: "Pricing",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.pricing_model?.replace(/_/g, " ") || "—"}</span>
    ),
  },
  {
    id: "route",
    header: "Route",
    cell: ({ row }) => {
      const r = row.original
      if (r.origin_city_code && r.destination_city_code) {
        return <span className="font-mono text-sm">{r.origin_city_code} → {r.destination_city_code}</span>
      }
      if (r.origin_ward_code && r.destination_ward_code) {
        return <span className="font-mono text-sm">{r.origin_ward_code} → {r.destination_ward_code}</span>
      }
      return <span className="font-mono text-sm capitalize">{r.service_type?.replace(/_/g, " ") || "—"}</span>
    },
  },
  {
    accessorKey: "active",
    header: "Active",
    cell: ({ row }) => (
      <span>{row.original.active ? "Yes" : "No"}</span>
    ),
  },
  {
    id: "rate",
    header: "Rate",
    cell: ({ row }) => {
      const r = row.original
      if (r.weight_bands && r.weight_bands.length > 0) {
        const band = r.weight_bands[0]
        if (band.price_cents) return <span>${(band.price_cents / 100).toFixed(2)}</span>
        if (band.rate_cents_per_km) return <span>${(band.rate_cents_per_km / 100).toFixed(2)}/km</span>
      }
      if (r.bands && r.bands.length > 0) {
        return <span>${(r.bands[0].price_cents / 100).toFixed(2)}</span>
      }
      return <span>—</span>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <ViewButton rate={row.original} />,
  },
]
