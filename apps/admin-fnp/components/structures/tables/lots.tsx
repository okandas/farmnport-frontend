"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryAdminLots } from "@/lib/query"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { lotColumns } from "@/components/structures/columns/lots"

export function LotsTable() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["admin-lots", { p: pagination.pageIndex + 1 }],
    queryFn: () => queryAdminLots({ p: pagination.pageIndex + 1 }),
    refetchOnWindowFocus: false,
  })

  const lots = data?.data?.data || []
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
        context: "lots",
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
        <Placeholder.Title>Error Fetching Lots</Placeholder.Title>
        <Placeholder.Description>Error fetching lots from the database</Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching Lots</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={lotColumns}
      data={lots}
      newUrl="/dashboard/farmnport/lots/new"
      tableName="Lot"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
    />
  )
}
