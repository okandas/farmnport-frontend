"use client"

import { useEffect, useRef, useState } from "react"
import { PaginationState } from "@tanstack/react-table"
import { useQuery } from "@tanstack/react-query"

import { queryRestaurantInvoices } from "@/lib/query"
import { RestaurantInvoice } from "@/lib/schemas"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { restaurantInvoiceColumns } from "@/components/structures/columns/restaurant-invoices"

export function RestaurantInvoicesTable() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [search, setSearch] = useState("")

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["dashboard-restaurant-invoices", pagination.pageIndex],
    queryFn: () => queryRestaurantInvoices({ p: pagination.pageIndex + 1 }),
    refetchOnWindowFocus: false,
  })

  const items = data?.data?.data as RestaurantInvoice[]
  const total = (data?.data?.total as number) ?? 0

  const hasShownError = useRef(false)
  useEffect(() => {
    if (isError && !hasShownError.current) {
      hasShownError.current = true
      handleFetchError(error, {
        onRetry: () => {
          hasShownError.current = false
          refetch()
        },
        context: "restaurant invoices",
      })
    }
    if (!isError) hasShownError.current = false
  }, [isError, error, refetch])

  if (isError) {
    return (
      <Placeholder>
        <Placeholder.Icon name="close" />
        <Placeholder.Title>Error Fetching Invoices</Placeholder.Title>
        <Placeholder.Description>Error fetching restaurant invoices</Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching Invoices</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={restaurantInvoiceColumns}
      data={items ?? []}
      tableName="Invoice"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
