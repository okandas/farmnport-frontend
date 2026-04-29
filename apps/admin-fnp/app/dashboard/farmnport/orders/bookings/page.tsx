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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookingsTable } from "@/components/structures/tables/bookings"

const TYPE_FILTERS = [
  { value: "livestock", label: "Livestock" },
  { value: "delivery", label: "Delivery" },
]

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "approved", label: "Approved" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

export default function AdminBookingsPage() {
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("")
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

  const bookingType = typeFilter === "all" ? undefined : typeFilter

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["admin-bookings", { type: bookingType, status: statusFilter, p: pagination.pageIndex + 1 }],
    queryFn: () => queryAdminBookings({ type: bookingType, status: statusFilter || undefined, p: pagination.pageIndex + 1 }),
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
        <div className="flex items-center justify-between gap-4">
          {/* Status tabs — primary filter */}
          <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPagination(p => ({ ...p, pageIndex: 0 })) }}>
            <TabsList>
              {STATUS_FILTERS.map((f) => (
                <TabsTrigger key={f.value} value={f.value}>{f.label}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Type select — secondary filter */}
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPagination(p => ({ ...p, pageIndex: 0 })) }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {TYPE_FILTERS.map((f) => (
                <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <BookingsTable bookings={bookings} total={total} pagination={pagination} setPagination={setPagination} />
      </div>
    </DashboardShell>
  )
}
