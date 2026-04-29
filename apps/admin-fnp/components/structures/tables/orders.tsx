"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryOrders } from "@/lib/query"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { orderColumns, OrderRow } from "@/components/structures/columns/orders"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const ORDER_TYPES = [
  { value: "all", label: "All channels" },
  { value: "retail", label: "Retail" },
  { value: "bundle", label: "Bundle" },
  { value: "marketplace", label: "Marketplace" },
  { value: "wholesale", label: "Wholesale" },
  { value: "pre_order", label: "Pre-orders" },
]

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

export function OrdersTable() {
  const [search, setSearch] = useState("")
  const [orderType, setOrderType] = useState("all")
  const [statusFilter, setStatusFilter] = useState("")
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const channelFilter = orderType === "all" ? undefined : orderType

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: [
      "admin-orders",
      {
        p: pagination.pageIndex + 1,
        search,
        order_type: channelFilter,
        status: statusFilter,
      },
    ],
    queryFn: () =>
      queryOrders({
        p: pagination.pageIndex + 1,
        search,
        limit: pagination.pageSize,
        order_type: channelFilter,
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
      <div className="flex items-center justify-between gap-4">
        {/* Status tabs — primary filter */}
        <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPagination(p => ({ ...p, pageIndex: 0 })) }}>
          <TabsList>
            {STATUS_FILTERS.map((status) => (
              <TabsTrigger key={status.value} value={status.value}>
                {status.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Channel select — secondary filter */}
        <Select value={orderType} onValueChange={(v) => { setOrderType(v); setPagination(p => ({ ...p, pageIndex: 0 })) }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All channels" />
          </SelectTrigger>
          <SelectContent>
            {ORDER_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
    </div>
  )
}
