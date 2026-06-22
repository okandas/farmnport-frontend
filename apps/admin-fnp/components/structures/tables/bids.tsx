"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryAdminBids } from "@/lib/query"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { bidColumns } from "@/components/structures/columns/bids"

export function BidsTable() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["admin-bids", { p: pagination.pageIndex + 1 }],
    queryFn: () => queryAdminBids({ p: pagination.pageIndex + 1 }),
    refetchOnWindowFocus: false,
  })

  const bids = data?.data?.data || []
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
        context: "bids",
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
        <Placeholder.Title>Error Fetching Bids</Placeholder.Title>
        <Placeholder.Description>Error fetching bids from the database</Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching Bids</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={bidColumns}
      data={bids}
      tableName="Bid"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
    />
  )
}
