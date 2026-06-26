"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryTableReservations } from "@/lib/query"
import { Placeholder } from "@/components/state/placeholder"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { FormSkeleton } from "@/components/state/skeleton-table"
import { DashboardShell } from "@/components/state/dashboardShell"
import { DataTable } from "@/components/structures/data-table"
import { reservationColumns, ReservationRow } from "@/components/structures/columns/reservations"
import { Button } from "@/components/ui/button"

const STATUSES = ["all", "pending", "confirmed", "seated", "completed", "cancelled", "no_show"]

export default function ReservationsPage() {
  const [status, setStatus] = useState("pending")
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

  const { isError, isLoading, isFetching, data } = useQuery({
    queryKey: ["admin-reservations", { status, p: pagination.pageIndex + 1 }],
    queryFn: () => queryTableReservations({ status: status === "all" ? undefined : status, p: pagination.pageIndex + 1 }),
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

      <div className="flex gap-2 flex-wrap mb-4">
        {STATUSES.map((s) => (
          <Button
            key={s}
            variant={status === s ? "default" : "outline"}
            size="sm"
            className="capitalize"
            onClick={() => { setStatus(s); setPagination((p) => ({ ...p, pageIndex: 0 })) }}
          >
            {s.replace("_", " ")}
          </Button>
        ))}
      </div>

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
        searchPlaceholder=""
      />
    </DashboardShell>
  )
}
