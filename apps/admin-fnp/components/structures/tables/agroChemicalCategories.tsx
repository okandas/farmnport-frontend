"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryAgroChemicalCategories } from "@/lib/query"
import { AgroChemicalCategory } from "@/lib/schemas"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { agroChemicalCategoryColumns } from "@/components/structures/columns/agroChemicalCategories"

export function AgroChemicalCategoriesTable() {
  const [search, setSearch] = useState("")

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 20,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["dashboard-agrochemical-categories", { p: pagination.pageIndex, search }],
    queryFn: () =>
      queryAgroChemicalCategories({
        p: pagination.pageIndex,
        search: search,
      }),
    refetchOnWindowFocus: false
  })

  const categories = data?.data?.data as AgroChemicalCategory[]
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
        context: "agrochemical categories"
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
          Error fetching agrochemical categories from the database
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
      columns={agroChemicalCategoryColumns}
      data={categories}
      newUrl="/dashboard/agrochemical-categories/new"
      tableName="AgroChemical Category"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
