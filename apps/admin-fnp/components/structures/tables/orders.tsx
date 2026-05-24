"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryOrders } from "@/lib/query"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { orderColumns, OrderRow } from "@/components/structures/columns/orders"
import { DataTableFacetedFilter } from "@/components/structures/filters/data-table-faceted-filter"

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Processing", value: "processing" },
  { label: "Dispatched", value: "dispatched" },
  { label: "Ready", value: "ready" },
  { label: "Delivered", value: "delivered" },
  { label: "Collected", value: "collected" },
  { label: "Cancelled", value: "cancelled" },
]

export function OrdersTable() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set())
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [statusFilter])

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: [
      "admin-orders",
      {
        p: pagination.pageIndex + 1,
        search,
        status: Array.from(statusFilter)[0],
      },
    ],
    queryFn: () =>
      queryOrders({
        p: pagination.pageIndex + 1,
        search,
        limit: pagination.pageSize,
        status: Array.from(statusFilter)[0] || undefined,
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
        context: "orders",
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
      <Placeholder>
        <Placeholder.Icon name="close" />
        <Placeholder.Title>Error Fetching Orders</Placeholder.Title>
        <Placeholder.Description>
          Something went wrong. Please try again.
        </Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching Orders</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <div className="flex flex-col gap-4">
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
        filters={
          <DataTableFacetedFilter
            title="Status"
            options={statusOptions}
            selectedValues={statusFilter}
            onValueChange={setStatusFilter}
          />
        }
      />
    </div>
  )
}
