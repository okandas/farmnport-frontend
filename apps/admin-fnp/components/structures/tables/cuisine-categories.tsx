"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryCuisineCategories } from "@/lib/query"
import { CuisineCategory } from "@/lib/schemas"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { cuisineCategoryColumns } from "@/components/structures/columns/cuisine-categories"

export function CuisineCategoriesTable() {
  const [search, setSearch] = useState("")

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["dashboard-cuisine-categories", { p: pagination.pageIndex + 1, search }],
    queryFn: () =>
      queryCuisineCategories({
        p: pagination.pageIndex + 1,
        search: search,
      }),
    refetchOnWindowFocus: false
  })

  const categories = data?.data?.data as CuisineCategory[]
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
        context: "cuisine categories"
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
          Error fetching cuisine categories from the database
        </Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching Categories</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={cuisineCategoryColumns}
      data={categories}
      newUrl="/dashboard/restaurants/cuisine-categories/new"
      tableName="Cuisine Category"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
