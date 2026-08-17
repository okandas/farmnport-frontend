"use client"

import { Suspense, useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { PaginationState } from "@tanstack/react-table"

import { adminListChefListings } from "@/lib/query"
import { Placeholder } from "@/components/state/placeholder"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { FormSkeleton } from "@/components/state/skeleton-table"
import { DashboardShell } from "@/components/state/dashboardShell"
import { DataTable } from "@/components/structures/data-table"
import { chefListingColumns, ChefListingRow } from "@/components/structures/columns/chef-listings"
import { DataTableFacetedFilter } from "@/components/structures/filters/data-table-faceted-filter"

const statusOptions = [
  { label: "Draft",  value: "draft" },
  { label: "Live",   value: "live" },
  { label: "Paused", value: "paused" },
]

const typeOptions = [
  { label: "Solo Chef",       value: "solo" },
  { label: "Catering",        value: "catering" },
  { label: "Private Kitchen", value: "private_kitchen" },
]

export default function ChefListingsPage() {
  return (
    <Suspense fallback={<DashboardShell><FormSkeleton /></DashboardShell>}>
      <ChefListingsContent />
    </Suspense>
  )
}

function ChefListingsContent() {
  const searchParams = useSearchParams()
  const chefID = searchParams.get("chef_id") ?? ""
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set())
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set())
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [statusFilter, typeFilter])

  const { isError, isLoading, isFetching, data } = useQuery({
    queryKey: ["admin-chef-listings", { chef_id: chefID, status: Array.from(statusFilter)[0], type: Array.from(typeFilter)[0], p: pagination.pageIndex + 1 }],
    queryFn: () => adminListChefListings({
      chef_id: chefID || undefined,
      status: Array.from(statusFilter)[0],
      type: Array.from(typeFilter)[0],
      p: pagination.pageIndex + 1,
    }),
    refetchOnWindowFocus: false,
  })

  const listings = (data?.data?.listings as ChefListingRow[]) ?? []
  const total = (data?.data?.total as number) ?? 0

  if (isError) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Chef Listings" text="Manage chef listings." />
        <Placeholder>
          <Placeholder.Icon name="close" />
          <Placeholder.Title>Error Fetching Listings</Placeholder.Title>
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
      <DashboardHeader heading="Chef Listings" text="Manage chef listings." />
      <DataTable
        columns={chefListingColumns}
        data={listings}
        newUrl="/dashboard/chefs/listings/new"
        tableName="Listing"
        total={total}
        pagination={pagination}
        setPagination={setPagination}
        search=""
        setSearch={() => {}}
        filters={
          <div className="flex gap-2">
            <DataTableFacetedFilter
              title="Status"
              options={statusOptions}
              selectedValues={statusFilter}
              onValueChange={setStatusFilter}
            />
            <DataTableFacetedFilter
              title="Type"
              options={typeOptions}
              selectedValues={typeFilter}
              onValueChange={setTypeFilter}
            />
          </div>
        }
      />
    </DashboardShell>
  )
}
