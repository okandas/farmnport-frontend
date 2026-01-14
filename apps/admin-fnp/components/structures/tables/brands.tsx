"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryBrands } from "@/lib/query"
import { Brand } from "@/lib/schemas"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { brandColumns } from "@/components/structures/columns/brands"

export function BrandsTable() {
  const [search, setSearch] = useState("")

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 20,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["dashboard-brands", { p: pagination.pageIndex, search }],
    queryFn: () =>
      queryBrands({
        p: pagination.pageIndex,
        search: search,
      }),
    refetchOnWindowFocus: false
  })

  const brands = data?.data?.data as Brand[]
  const total = data?.data?.total as number

  // Show error toast only once when error occurs
  const hasShownError = useRef(false)
  useEffect(() => {
    if (isError && !hasShownError.current) {
      hasShownError.current = true
      handleFetchError(error, {
        onRetry: () => {
          hasShownError.current = false
          refetch()
        },
        context: "brands"
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
        <Placeholder.Title>Error Fetching Brands</Placeholder.Title>
        <Placeholder.Description>
          Error fetching brands from the database
        </Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching Brands</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={brandColumns}
      data={brands}
      newUrl="/dashboard/brands/new"
      tableName="Brand"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
