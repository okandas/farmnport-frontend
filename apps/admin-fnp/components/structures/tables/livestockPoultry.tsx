"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryLivestockPoultryProducts } from "@/lib/query"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { TableSkeleton } from "@/components/state/skeleton-table"
import { DataTable } from "@/components/structures/data-table"
import { livestockPoultryColumns } from "@/components/structures/columns/livestockPoultry"

export function LivestockPoultryTable() {
  const [search, setSearch] = useState("")
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["livestock-poultry-products", { p: pagination.pageIndex + 1, search }],
    queryFn: () => queryLivestockPoultryProducts({ p: pagination.pageIndex + 1, search }),
    refetchOnWindowFocus: false,
  })

  const products = data?.data?.data || []
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
        context: "livestock poultry products",
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
        <Placeholder.Title>Error Fetching Products</Placeholder.Title>
        <Placeholder.Description>Error fetching livestock & poultry products from the database</Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return <TableSkeleton />
  }

  return (
    <DataTable
      columns={livestockPoultryColumns}
      data={products}
      newUrl="/dashboard/farmnport/livestock-poultry/new"
      tableName="Product"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
