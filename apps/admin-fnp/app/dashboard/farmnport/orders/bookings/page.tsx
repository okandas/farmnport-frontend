"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryAdminBookings } from "@/lib/query"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookingsTable } from "@/components/structures/tables/bookings"

const TYPE_FILTERS = [
  { value: "", label: "All" },
  { value: "livestock", label: "Livestock" },
  { value: "delivery", label: "Delivery" },
]

const STATUS_FILTERS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "approved", label: "Approved" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

export default function AdminBookingsPage() {
  const [typeFilter, setTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["admin-bookings", { type: typeFilter, status: statusFilter, p: pagination.pageIndex + 1 }],
    queryFn: () => queryAdminBookings({ type: typeFilter || undefined, status: statusFilter || undefined, p: pagination.pageIndex + 1 }),
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

      <div className="flex flex-col gap-4">
        <Tabs value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPagination(p => ({ ...p, pageIndex: 0 })) }}>
          <TabsList>
            {TYPE_FILTERS.map((f) => (
              <TabsTrigger key={f.value} value={f.value}>{f.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPagination(p => ({ ...p, pageIndex: 0 })) }}>
          <TabsList>
            {STATUS_FILTERS.map((f) => (
              <TabsTrigger key={f.value} value={f.value}>{f.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <BookingsTable bookings={bookings} total={total} pagination={pagination} setPagination={setPagination} />
      </div>
    </DashboardShell>
  )
}
