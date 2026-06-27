"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryLotBids } from "@/lib/query"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { TableSkeleton } from "@/components/state/skeleton-table"
import { DataTable } from "@/components/structures/data-table"
import { bidColumns } from "@/components/structures/columns/bids"

export function BidsTable({ slug }: { slug: string }) {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })
  const [search, setSearch] = useState("")

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["lot-bids", slug, { p: pagination.pageIndex + 1 }],
    queryFn: () => queryLotBids(slug, pagination.pageIndex + 1),
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
    if (!isError) hasShownError.current = false
  }, [isError, error, refetch])

  if (isError) {
    return (
      <Placeholder>
        <Placeholder.Icon name="close" />
        <Placeholder.Title>Error Fetching Bids</Placeholder.Title>
        <Placeholder.Description>Error fetching bids for this lot</Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return <TableSkeleton />
  }

  if (bids.length === 0) {
    return (
      <Placeholder>
        <Placeholder.Icon name="gavel" />
        <Placeholder.Title>No Bids Yet</Placeholder.Title>
        <Placeholder.Description>No bids have been placed on this lot</Placeholder.Description>
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
      search={search}
      setSearch={setSearch}
    />
  )
}
