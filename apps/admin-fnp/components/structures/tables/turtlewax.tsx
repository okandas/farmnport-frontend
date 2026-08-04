"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryTurtlewaxProducts } from "@/lib/query"
import { TurtlewaxProductItem } from "@/lib/schemas"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { TableSkeleton } from "@/components/state/skeleton-table"
import { DataTable } from "@/components/structures/data-table"
import { turtlewaxProductColumns } from "@/components/structures/columns/turtlewax"

export function TurtlewaxProductsTable() {
  const [search, setSearch] = useState("")

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["dashboard-turtlewax-products", { p: pagination.pageIndex + 1, search }],
    queryFn: () =>
      queryTurtlewaxProducts({
        p: pagination.pageIndex + 1,
        search: search,
      }),
    refetchOnWindowFocus: false
  })

  const products = data?.data?.data as TurtlewaxProductItem[]
  const total = data?.data?.total as number

  const hasShownError = useRef(false)
  useEffect(() => {
    if (isError && !hasShownError.current) {
      hasShownError.current = true
      handleFetchError(error, {
        onRetry: () => {
          hasShownError.current = false
          refetch()
        },
        context: "turtlewax products"
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
        <Placeholder.Title>Error Fetching Turtlewax Products</Placeholder.Title>
        <Placeholder.Description>
          Error fetching turtlewax products from the database
        </Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return <TableSkeleton />
  }

  return (
    <DataTable
      columns={turtlewaxProductColumns}
      data={products || []}
      newUrl="/dashboard/turtlewax/products/new"
      tableName="Turtlewax Product"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
