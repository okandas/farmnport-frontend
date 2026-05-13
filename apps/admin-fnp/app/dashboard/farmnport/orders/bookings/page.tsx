"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryAdminBookings } from "@/lib/query"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { BookingsTable } from "@/components/structures/tables/bookings"

export default function AdminBookingsPage() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["admin-bookings", { p: pagination.pageIndex + 1 }],
    queryFn: () => queryAdminBookings({ p: pagination.pageIndex + 1 }),
    refetchOnWindowFocus: false,
  })

  if (isError) {
    handleFetchError(error, { onRetry: () => refetch(), context: "bookings" })
    return (
      <DashboardShell>
        <DashboardHeader heading="Bookings" text="Manage livestock and delivery bookings." />
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
        <DashboardHeader heading="Bookings" text="Manage livestock and delivery bookings." />
        <Placeholder>
          <Placeholder.Title>Fetching Bookings</Placeholder.Title>
        </Placeholder>
      </DashboardShell>
    )
  }

  const bookings = (data?.data?.bookings as any[]) ?? []
  const total = (data?.data?.total as number) ?? 0

  return (
    <DashboardShell>
      <DashboardHeader heading="Bookings" text="Manage livestock and delivery bookings." />

      <BookingsTable bookings={bookings} total={total} pagination={pagination} setPagination={setPagination} />
    </DashboardShell>
  )
}
