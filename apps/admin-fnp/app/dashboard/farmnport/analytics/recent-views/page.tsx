"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState, ColumnDef, createColumnHelper } from "@tanstack/react-table"
import Link from "next/link"

import { queryRecentViewedContacts } from "@/lib/query"
import { formatDate } from "@/lib/utilities"
import { DataTable } from "@/components/structures/data-table"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"

type ViewedContact = {
  viewed_id: string
  name: string
  type: string
  city: string
  primary_category: string
  main_produce: string
  last_date: string
}

const columnHelper = createColumnHelper<ViewedContact>()

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/farmnport/contact-views/contact/${row.original.viewed_id}`}
        className="font-medium capitalize hover:text-primary transition-colors"
      >
        {row.getValue("name")}
      </Link>
    ),
  }),
  columnHelper.accessor("type", {
    header: "Type",
    cell: ({ row }) => {
      const t = row.getValue("type") as string
      return (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
          t === "farmer" ? "bg-green-100 text-green-800"
          : t === "buyer" ? "bg-blue-100 text-blue-800"
          : "bg-muted text-muted-foreground"
        }`}>
          {t || "—"}
        </span>
      )
    },
  }),
  columnHelper.accessor("city", {
    header: "City",
    cell: ({ row }) => <span className="capitalize">{row.getValue("city") || "—"}</span>,
  }),
  columnHelper.accessor("primary_category", {
    header: "Category",
    cell: ({ row }) => <span className="capitalize">{row.getValue("primary_category") || "—"}</span>,
  }),
  columnHelper.accessor("main_produce", {
    header: "Main Produce",
    cell: ({ row }) => <span className="capitalize">{row.getValue("main_produce") || "—"}</span>,
  }),
  columnHelper.accessor("last_date", {
    header: () => <div className="text-right">Last Viewed</div>,
    cell: ({ row }) => (
      <div className="text-right text-muted-foreground">{formatDate(row.getValue("last_date")) || "—"}</div>
    ),
  }),
] as ColumnDef<ViewedContact>[]

const PAGE_SIZE = 20

export default function RecentViewsPage() {
  const [search, setSearch] = useState("")
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })

  const { data } = useQuery({
    queryKey: ["recent-viewed-contacts", pagination.pageIndex + 1],
    queryFn: () => queryRecentViewedContacts(pagination.pageIndex + 1, PAGE_SIZE),
    refetchOnWindowFocus: false,
  })

  const contacts: ViewedContact[] = data?.data?.contacts || []
  const total: number = data?.data?.total || 0

  return (
    <DashboardShell>
      <DashboardHeader heading="Recently Viewed Contacts" text="Contacts sorted by most recently viewed." />
      <DataTable
        columns={columns}
        data={contacts}
        tableName="Contact"
        total={total}
        pagination={pagination}
        setPagination={setPagination}
        search={search}
        setSearch={setSearch}
        searchPlaceholder="Search contacts..."
      />
    </DashboardShell>
  )
}
