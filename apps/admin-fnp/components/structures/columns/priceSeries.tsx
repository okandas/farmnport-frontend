"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"

export type PriceSeriesEntry = {
  id?: string
  submission_id: string
  effective_date: string
  client_id: string
  client_name: string
  template_type: "cdm" | "lwt"
  code: string
  name: string
  category: string
  type: string
  weight_min_grams?: number
  weight_max_grams?: number
  price_per_kg?: number
  pricing: {
    collected?: number
    delivered?: number
  }
  notes?: string
}

const codeColors = [
  "bg-blue-50 text-blue-700 ring-blue-600/20",
  "bg-green-50 text-green-700 ring-green-600/20",
  "bg-amber-50 text-amber-700 ring-amber-600/20",
  "bg-purple-50 text-purple-700 ring-purple-600/20",
  "bg-rose-50 text-rose-700 ring-rose-600/20",
  "bg-cyan-50 text-cyan-700 ring-cyan-600/20",
  "bg-orange-50 text-orange-700 ring-orange-600/20",
  "bg-teal-50 text-teal-700 ring-teal-600/20",
  "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
  "bg-lime-50 text-lime-700 ring-lime-600/20",
]

function codeColor(code: string): string {
  let hash = 0
  for (let i = 0; i < code.length; i++) hash = (hash * 31 + code.charCodeAt(i)) >>> 0
  return codeColors[hash % codeColors.length]
}

function centsToDisplay(cents?: number): string {
  if (cents == null) return "—"
  return `$${(cents / 100).toFixed(2)}`
}

function weightDisplay(minG?: number, maxG?: number): string {
  if (minG == null) return "—"
  const min = minG / 1000
  const max = maxG != null ? maxG / 1000 : null
  return max != null ? `${min}–${max} kg` : `${min}+ kg`
}

export const priceSeriesColumns: ColumnDef<PriceSeriesEntry>[] = [
  {
    accessorKey: "effective_date",
    header: "Date",
    cell: ({ row }) => {
      const d = row.getValue("effective_date") as string
      return <span className="whitespace-nowrap">{new Date(d).toLocaleDateString("en-GB")}</span>
    },
  },
  {
    accessorKey: "client_name",
    header: "Client",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("client_name") || row.original.client_id}</span>
    ),
  },
  {
    accessorKey: "template_type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="rounded-md">{(row.getValue("template_type") as string).toUpperCase()}</Badge>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.getValue("category")}</span>
    ),
  },
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => {
      const code = row.getValue("code") as string
      return (
        <span className={`font-mono text-xs px-1.5 py-0.5 rounded-md ring-1 ring-inset whitespace-nowrap ${codeColor(code)}`}>
          {code}
        </span>
      )
    },
  },
  {
    accessorKey: "name",
    header: "Grade",
    cell: ({ row }) => <span className="text-sm">{row.getValue("name")}</span>,
  },
  {
    id: "weight",
    header: "Weight Band",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {weightDisplay(row.original.weight_min_grams, row.original.weight_max_grams)}
      </span>
    ),
  },
  {
    id: "price_per_kg",
    header: "Price/kg",
    cell: ({ row }) => (
      <span className="text-sm">{centsToDisplay(row.original.price_per_kg)}</span>
    ),
  },
  {
    id: "collected",
    header: "Collected",
    cell: ({ row }) => (
      <span className="text-sm">{centsToDisplay(row.original.pricing?.collected)}</span>
    ),
  },
  {
    id: "delivered",
    header: "Delivered",
    cell: ({ row }) => (
      <span className="text-sm">{centsToDisplay(row.original.pricing?.delivered)}</span>
    ),
  },
]
