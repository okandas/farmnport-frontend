"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { PaginationState } from "@tanstack/react-table"

import { adminListChefBookings } from "@/lib/query"
import { Placeholder } from "@/components/state/placeholder"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { FormSkeleton } from "@/components/state/skeleton-table"
import { DashboardShell } from "@/components/state/dashboardShell"
import { DataTable } from "@/components/structures/data-table"
import { chefBookingColumns, ChefBookingRow } from "@/components/structures/columns/chef-bookings"
import { DataTableFacetedFilter } from "@/components/structures/filters/data-table-faceted-filter"

const statusOptions = [
  { label: "Pending Payment", value: "pending_payment" },
  { label: "Paid",            value: "paid" },
  { label: "Confirmed",       value: "confirmed" },
  { label: "Declined",        value: "declined" },
  { label: "Completed",       value: "completed" },
  { label: "Cancelled",       value: "cancelled" },
  { label: "Refunded",        value: "refunded" },
]

export default function ChefBookingsPage() {
  const searchParams = useSearchParams()
  const chefID = searchParams.get("chef_id") ?? ""
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set())
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [statusFilter])

  const { isError, isLoading, isFetching, data } = useQuery({
    queryKey: ["admin-chef-bookings", { chef_id: chefID, status: Array.from(statusFilter)[0], p: pagination.pageIndex + 1 }],
    queryFn: () => adminListChefBookings({
      chef_id: chefID || undefined,
      status: Array.from(statusFilter)[0],
      p: pagination.pageIndex + 1,
    }),
    refetchOnWindowFocus: false,
  })

  const bookings = (data?.data?.bookings as ChefBookingRow[]) ?? []
  const total = (data?.data?.total as number) ?? 0

  if (isError) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Chef Bookings" text="Manage chef bookings." />
        <Placeholder>
          <Placeholder.Icon name="close" />
          <Placeholder.Title>Error Fetching Bookings</Placeholder.Title>
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
      <DashboardHeader heading="Chef Bookings" text="Manage chef bookings." />
      <DataTable
        columns={chefBookingColumns}
        data={bookings}
        newUrl=""
        tableName="Booking"
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
