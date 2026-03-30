"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryOrders } from "@/lib/query"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { DataTable } from "@/components/structures/data-table"
import { orderColumns, OrderRow } from "@/components/structures/columns/orders"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const STATUS_FILTERS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "dispatched", label: "Dispatched" },
  { value: "ready", label: "Ready" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
]

export default function RestaurantOrdersPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: [
      "admin-orders",
      "restaurant",
      { p: pagination.pageIndex + 1, search, status: statusFilter },
    ],
    queryFn: () =>
      queryOrders({
        p: pagination.pageIndex + 1,
        search,
        limit: pagination.pageSize,
        order_type: "restaurant",
        status: statusFilter || undefined,
      }),
    refetchOnWindowFocus: false,
  })

  const hasShownError = useRef(false)

  useEffect(() => {
    if (isError && !hasShownError.current) {
      hasShownError.current = true
      handleFetchError(error, {
        onRetry: () => {
          hasShownError.current = false
          refetch()
        },
        context: "restaurant orders",
      })
    }
    if (!isError) {
      hasShownError.current = false
    }
  }, [isError, error, refetch])

  const orders = (data?.data?.orders as OrderRow[]) ?? []
  const total = (data?.data?.total as number) ?? 0

  if (isError) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Restaurant Orders" text="Manage restaurant orders." />
        <Placeholder>
          <Placeholder.Icon name="close" />
          <Placeholder.Title>Error Fetching Orders</Placeholder.Title>
          <Placeholder.Description>
            Something went wrong. Please try again.
          </Placeholder.Description>
        </Placeholder>
      </DashboardShell>
    )
  }

  if (isLoading || isFetching) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Restaurant Orders" text="Manage restaurant orders." />
        <Placeholder>
          <Placeholder.Title>Fetching Orders</Placeholder.Title>
        </Placeholder>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Restaurant Orders" text="Manage restaurant orders." />

      <Tabs
        value={statusFilter}
        onValueChange={(v) => {
          setStatusFilter(v)
          setPagination((p) => ({ ...p, pageIndex: 0 }))
        }}
      >
        <TabsList>
          {STATUS_FILTERS.map((status) => (
            <TabsTrigger key={status.value} value={status.value}>
              {status.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DataTable
        columns={orderColumns}
        data={orders}
        newUrl=""
        tableName="Order"
        total={total}
        pagination={pagination}
        setPagination={setPagination}
        search={search}
        setSearch={setSearch}
        searchPlaceholder="Search orders..."
      />
    </DashboardShell>
  )
}
