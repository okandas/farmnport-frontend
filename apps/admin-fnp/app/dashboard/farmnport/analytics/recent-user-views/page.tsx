"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ColumnDef, createColumnHelper, PaginationState } from "@tanstack/react-table"
import Link from "next/link"

import { queryRecentUserViews } from "@/lib/query"
import { formatDate } from "@/lib/utilities"
import { DataTable } from "@/components/structures/data-table"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"

type UserViewRow = {
  user_id: string
  name: string
  type: string
  contacts_viewed: number
  contacts_viewed_them: number
  last_viewed: string
  last_viewed_them: string
}

const columnHelper = createColumnHelper<UserViewRow>()

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/farmnport/contact-views/viewer/${row.original.user_id}`}
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
  columnHelper.accessor("contacts_viewed", {
    header: () => <div className="text-right">Contacts Viewed</div>,
    cell: ({ row }) => (
      <div className="text-right font-semibold">{row.getValue("contacts_viewed") || "—"}</div>
    ),
  }),
  columnHelper.accessor("contacts_viewed_them", {
    header: () => <div className="text-right">Viewed Them</div>,
    cell: ({ row }) => (
      <div className="text-right font-semibold">{row.getValue("contacts_viewed_them") || "—"}</div>
    ),
  }),
  columnHelper.accessor("last_viewed", {
    header: () => <div className="text-right">Last Viewed</div>,
    cell: ({ row }) => (
      <div className="text-right text-muted-foreground">{formatDate(row.getValue("last_viewed")) || "—"}</div>
    ),
  }),
  columnHelper.accessor("last_viewed_them", {
    header: () => <div className="text-right">Last View Received</div>,
    cell: ({ row }) => (
      <div className="text-right text-muted-foreground">{formatDate(row.getValue("last_viewed_them")) || "—"}</div>
    ),
  }),
] as ColumnDef<UserViewRow>[]

const PAGE_SIZE = 20

export default function RecentUserViewsPage() {
  const [search, setSearch] = useState("")
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  })

  const { data } = useQuery({
    queryKey: ["recent-user-views", pagination.pageIndex + 1],
    queryFn: () => queryRecentUserViews(pagination.pageIndex + 1, PAGE_SIZE),
    refetchOnWindowFocus: false,
  })

  const users: UserViewRow[] = data?.data?.users || []
  const total: number = data?.data?.total || 0

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Recent User Views"
        text="Users sorted by most recently active."
      />
      <DataTable
        columns={columns}
        data={users}
        tableName="User"
        total={total}
        pagination={pagination}
        setPagination={setPagination}
        search={search}
        setSearch={setSearch}
        searchPlaceholder="Search users..."
      />
    </DashboardShell>
  )
}
