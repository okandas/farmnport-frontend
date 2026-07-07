"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryAdminPreOrders } from "@/lib/query"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { TableSkeleton } from "@/components/state/skeleton-table"
import { DataTable } from "@/components/structures/data-table"
import { preorderColumns } from "@/components/structures/columns/preorders"

export function PreOrdersTable() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [search, setSearch] = useState("")

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["admin-preorders", { p: pagination.pageIndex + 1, search }],
    queryFn: () => queryAdminPreOrders(),
    refetchOnWindowFocus: false,
  })

  const events = data?.data?.preorders || []
  const total = events.length

  const hasShownError = useRef(false)
  useEffect(() => {
    if (isError && !hasShownError.current) {
      hasShownError.current = true
      handleFetchError(error, {
        onRetry: () => {
          hasShownError.current = false
          refetch()
        },
        context: "pre-orders",
      })
    }
    if (!isError) {
      hasShownError.current = false
    }
  }, [isError, error, refetch])

  if (isError) {
    return (
      <Placeholder>
        <Placeholder.Icon name="close" />
        <Placeholder.Title>Error Fetching Pre-Orders</Placeholder.Title>
        <Placeholder.Description>Error fetching pre-orders from the database</Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return <TableSkeleton />
  }

  return (
    <DataTable
      columns={preorderColumns}
      data={events}
      newUrl="/dashboard/farmnport/orders/booking-preorders/new"
      tableName="Pre-Order"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
