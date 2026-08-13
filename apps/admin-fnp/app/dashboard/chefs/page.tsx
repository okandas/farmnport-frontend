"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { adminListChefs } from "@/lib/query"
import { Placeholder } from "@/components/state/placeholder"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { FormSkeleton } from "@/components/state/skeleton-table"
import { DashboardShell } from "@/components/state/dashboardShell"
import { DataTable } from "@/components/structures/data-table"
import { chefColumns, ChefRow } from "@/components/structures/columns/chefs"
import { DataTableFacetedFilter } from "@/components/structures/filters/data-table-faceted-filter"

const statusOptions = [
  { label: "Pending",   value: "pending" },
  { label: "Approved",  value: "approved" },
  { label: "Suspended", value: "suspended" },
]

export default function ChefsPage() {
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set())
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [statusFilter])

  const { isError, isLoading, isFetching, data } = useQuery({
    queryKey: ["admin-chefs", { status: Array.from(statusFilter)[0], p: pagination.pageIndex + 1 }],
    queryFn: () => adminListChefs({
      status: Array.from(statusFilter)[0],
      p: pagination.pageIndex + 1,
    }),
    refetchOnWindowFocus: false,
  })

  const chefs = (data?.data?.chefs as ChefRow[]) ?? []
  const total = (data?.data?.total as number) ?? 0

  if (isError) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Chefs" text="Manage chef profiles." />
        <Placeholder>
          <Placeholder.Icon name="close" />
          <Placeholder.Title>Error Fetching Chefs</Placeholder.Title>
          <Placeholder.Description>Something went wrong. Please try again.</Placeholder.Description>
        </Placeholder>
      </DashboardShell>
    )
  }

  if (isLoading || isFetching) {
    return (
      <DashboardShell>
        <FormSkeleton />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Chefs" text="Manage chef profiles." />
      <DataTable
        columns={chefColumns}
        data={chefs}
        newUrl="/dashboard/chefs/new"
        tableName="Chef"
        total={total}
        pagination={pagination}
        setPagination={setPagination}
        search=""
        setSearch={() => {}}
        filters={
          <DataTableFacetedFilter
            title="Status"
            options={statusOptions}
            selectedValues={statusFilter}
            onValueChange={setStatusFilter}
          />
        }
      />
    </DashboardShell>
  )
}
