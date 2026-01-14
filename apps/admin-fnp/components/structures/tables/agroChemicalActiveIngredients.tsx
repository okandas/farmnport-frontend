"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryAgroChemicalActiveIngredients } from "@/lib/query"
import { AgroChemicalActiveIngredient } from "@/lib/schemas"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { agroChemicalActiveIngredientColumns } from "@/components/structures/columns/agroChemicalActiveIngredients"

export function AgroChemicalActiveIngredientsTable() {
  const [search, setSearch] = useState("")

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 20,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["dashboard-agrochemical-active-ingredients", { p: pagination.pageIndex, search }],
    queryFn: () =>
      queryAgroChemicalActiveIngredients({
        p: pagination.pageIndex,
        search: search,
      }),
    refetchOnWindowFocus: false
  })

  const ingredients = data?.data?.data as AgroChemicalActiveIngredient[]
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
        context: "agrochemical active ingredients"
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
        <Placeholder.Title>Error Fetching Active Ingredients</Placeholder.Title>
        <Placeholder.Description>
          Error fetching agrochemical active ingredients from the database
        </Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching Active Ingredients</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={agroChemicalActiveIngredientColumns}
      data={ingredients}
      newUrl="/dashboard/agrochemical-active-ingredients/new"
      tableName="AgroChemical Active Ingredient"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
