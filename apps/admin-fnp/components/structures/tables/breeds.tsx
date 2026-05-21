"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryBreeds } from "@/lib/query"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { breedColumns } from "@/components/structures/columns/breeds"

export function BreedsTable() {
  const [search, setSearch] = useState("")
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["breeds", { p: pagination.pageIndex + 1, search }],
    queryFn: () => queryBreeds({ p: pagination.pageIndex + 1, search }),
    refetchOnWindowFocus: false,
  })

  const breeds = data?.data?.data || []
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
        context: "breeds",
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
        <Placeholder.Title>Error Fetching Breeds</Placeholder.Title>
        <Placeholder.Description>Error fetching breeds from the database</Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching Breeds</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={breedColumns}
      data={breeds}
      newUrl="/dashboard/farmnport/breeds/new"
      tableName="Breed"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
