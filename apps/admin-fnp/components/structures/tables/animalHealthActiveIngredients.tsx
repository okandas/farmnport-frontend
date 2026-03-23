"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryAnimalHealthActiveIngredients } from "@/lib/query"
import { AnimalHealthActiveIngredient } from "@/lib/schemas"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { animalHealthActiveIngredientColumns } from "@/components/structures/columns/animalHealthActiveIngredients"

export function AnimalHealthActiveIngredientsTable() {
  const [search, setSearch] = useState("")

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["dashboard-animal-health-active-ingredients", { p: pagination.pageIndex + 1, search }],
    queryFn: () =>
      queryAnimalHealthActiveIngredients({
        p: pagination.pageIndex + 1,
        search: search,
      }),
    refetchOnWindowFocus: false
  })

  const ingredients = data?.data?.data as AnimalHealthActiveIngredient[]
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
        context: "animal health active ingredients"
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
          Error fetching animal health active ingredients from the database
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
      columns={animalHealthActiveIngredientColumns}
      data={ingredients}
      newUrl="/dashboard/animal-health-active-ingredients/new"
      tableName="Animal Health Active Ingredient"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
