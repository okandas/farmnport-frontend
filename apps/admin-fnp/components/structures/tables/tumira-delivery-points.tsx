"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryTumiraDeliveryPoints } from "@/lib/query"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { TableSkeleton } from "@/components/state/skeleton-table"
import { DataTable } from "@/components/structures/data-table"
import { tumiraDeliveryPointColumns, TumiraDeliveryPoint } from "@/components/structures/columns/tumira-delivery-points"

export function TumiraDeliveryPointsTable() {
  const [search, setSearch] = useState("")
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["tumira-delivery-points", { p: pagination.pageIndex + 1, search }],
    queryFn: () => queryTumiraDeliveryPoints({ p: pagination.pageIndex + 1, search }),
    refetchOnWindowFocus: false,
  })

  const points = (data?.data?.data as TumiraDeliveryPoint[]) || []
  const total = (data?.data?.total as number) || 0

  const hasShownError = useRef(false)
  useEffect(() => {
    if (isError && !hasShownError.current) {
      hasShownError.current = true
      handleFetchError(error, {
        onRetry: () => {
          hasShownError.current = false
          refetch()
        },
        context: "delivery points",
      })
    }
    if (!isError) hasShownError.current = false
  }, [isError, error, refetch])

  if (isError) {
    return (
      <Placeholder>
        <Placeholder.Icon name="close" />
        <Placeholder.Title>Error Fetching Delivery Points</Placeholder.Title>
        <Placeholder.Description>Error fetching delivery points from Tumira</Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return <TableSkeleton />
  }

  return (
    <DataTable
      columns={tumiraDeliveryPointColumns}
      data={points}
      tableName="Delivery Point"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
