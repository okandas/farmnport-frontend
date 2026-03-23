"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryFeedNutritionalSpecs } from "@/lib/query"
import { FeedNutritionalSpec } from "@/lib/schemas"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { feedNutritionalSpecColumns } from "@/components/structures/columns/feedNutritionalSpecs"

export function FeedNutritionalSpecsTable() {
  const [search, setSearch] = useState("")

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 20,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["dashboard-feed-nutritional-specs", { p: pagination.pageIndex, search }],
    queryFn: () =>
      queryFeedNutritionalSpecs({
        p: pagination.pageIndex,
        search: search,
      }),
    refetchOnWindowFocus: false
  })

  const specs = data?.data?.data as FeedNutritionalSpec[]
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
        context: "feed nutritional specs"
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
        <Placeholder.Title>Error Fetching Nutritional Specs</Placeholder.Title>
        <Placeholder.Description>
          Error fetching feed nutritional specs from the database
        </Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching Nutritional Specs</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={feedNutritionalSpecColumns}
      data={specs}
      newUrl="/dashboard/feed-nutritional-specs/new"
      tableName="Feed Nutritional Spec"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
