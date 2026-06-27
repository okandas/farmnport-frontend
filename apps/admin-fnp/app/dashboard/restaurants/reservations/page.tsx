"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryTableReservations } from "@/lib/query"
import { Placeholder } from "@/components/state/placeholder"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { FormSkeleton } from "@/components/state/skeleton-table"
import { DashboardShell } from "@/components/state/dashboardShell"
import { DataTable } from "@/components/structures/data-table"
import { reservationColumns, ReservationRow } from "@/components/structures/columns/reservations"
import { DataTableFacetedFilter } from "@/components/structures/filters/data-table-faceted-filter"

const statusOptions = [
  { label: "Pending",   value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Seated",    value: "seated" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "No Show",   value: "no_show" },
]

export default function ReservationsPage() {
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set())
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [statusFilter])

  const { isError, isLoading, isFetching, data } = useQuery({
    queryKey: ["admin-reservations", { status: Array.from(statusFilter)[0], p: pagination.pageIndex + 1 }],
    queryFn: () => queryTableReservations({
      status: Array.from(statusFilter)[0],
      p: pagination.pageIndex + 1,
    }),
    refetchOnWindowFocus: false,
  })

  const reservations = (data?.data?.reservations as ReservationRow[]) ?? []
  const total = (data?.data?.total as number) ?? 0

  if (isError) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Reservations" text="Manage table reservations." />
        <Placeholder>
          <Placeholder.Icon name="close" />
          <Placeholder.Title>Error Fetching Reservations</Placeholder.Title>
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
      <DashboardHeader heading="Reservations" text="Manage table reservations." />
      <DataTable
        columns={reservationColumns}
        data={reservations}
        newUrl=""
        tableName="Reservation"
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
