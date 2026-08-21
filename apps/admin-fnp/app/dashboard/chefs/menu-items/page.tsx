"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { adminListChefMenuItems, adminListChefs } from "@/lib/query"
import { Placeholder } from "@/components/state/placeholder"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { FormSkeleton } from "@/components/state/skeleton-table"
import { DashboardShell } from "@/components/state/dashboardShell"
import { DataTable } from "@/components/structures/data-table"
import { chefMenuItemColumns, ChefMenuItemRow } from "@/components/structures/columns/chef-menu-items"
import { DataTableFacetedFilter } from "@/components/structures/filters/data-table-faceted-filter"

const statusOptions = [
  { label: "Active",   value: "active" },
  { label: "Inactive", value: "inactive" },
]

export default function ChefMenuItemsPage() {
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set())
  const [chefFilter, setChefFilter] = useState<Set<string>>(new Set())
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [statusFilter, chefFilter])

  const { data: chefsData } = useQuery({
    queryKey: ["admin-chefs-all"],
    queryFn: () => adminListChefs(),
    refetchOnWindowFocus: false,
  })

  const chefOptions = ((chefsData?.data?.chefs as { id: string; name: string }[]) ?? []).map((c) => ({
    label: c.name,
    value: c.id,
  }))

  const { isError, isLoading, isFetching, data } = useQuery({
    queryKey: ["admin-chef-menu-items", { chef_id: Array.from(chefFilter)[0], p: pagination.pageIndex + 1 }],
    queryFn: () => adminListChefMenuItems({
      chef_id: Array.from(chefFilter)[0],
      p: pagination.pageIndex + 1,
    }),
    refetchOnWindowFocus: false,
  })

  const items = (data?.data?.data as ChefMenuItemRow[]) ?? []
  const total = (data?.data?.total as number) ?? 0

  if (isError) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Menu Items" text="Manage chef menu items." />
        <Placeholder>
          <Placeholder.Icon name="close" />
          <Placeholder.Title>Error Fetching Menu Items</Placeholder.Title>
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
      <DashboardHeader heading="Menu Items" text="Manage chef menu items." />
      <DataTable
        columns={chefMenuItemColumns}
        data={items}
        newUrl="/dashboard/chefs/menu-items/new"
        tableName="Menu Item"
        total={total}
        pagination={pagination}
        setPagination={setPagination}
        search=""
        setSearch={() => {}}
        filters={
          <>
            <DataTableFacetedFilter
              title="Chef"
              options={chefOptions}
              selectedValues={chefFilter}
              onValueChange={setChefFilter}
            />
            <DataTableFacetedFilter
              title="Status"
              options={statusOptions}
              selectedValues={statusFilter}
              onValueChange={setStatusFilter}
            />
          </>
        }
      />
    </DashboardShell>
  )
}
