"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryTurtlewaxCategories } from "@/lib/query"
import { TurtlewaxCategory } from "@/lib/schemas"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { TableSkeleton } from "@/components/state/skeleton-table"
import { DataTable } from "@/components/structures/data-table"
import { turtlewaxCategoryColumns } from "@/components/structures/columns/turtlewaxCategories"

export function TurtlewaxCategoriesTable() {
  const [search, setSearch] = useState("")

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["dashboard-turtlewax-categories", { p: pagination.pageIndex + 1, search }],
    queryFn: () =>
      queryTurtlewaxCategories({
        p: pagination.pageIndex + 1,
        search: search,
      }),
    refetchOnWindowFocus: false
  })

  const categories = data?.data?.data as TurtlewaxCategory[]
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
        context: "turtlewax categories"
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
        <Placeholder.Title>Error Fetching Categories</Placeholder.Title>
        <Placeholder.Description>
          Error fetching turtlewax categories from the database
        </Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return <TableSkeleton />
  }

  return (
    <DataTable
      columns={turtlewaxCategoryColumns}
      data={categories || []}
      newUrl="/dashboard/turtlewax/categories/new"
      tableName="Turtlewax Category"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
