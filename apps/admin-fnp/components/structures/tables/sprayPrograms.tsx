"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { querySprayPrograms } from "@/lib/query"
import { SprayProgram } from "@/lib/schemas"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { sprayProgramColumns } from "@/components/structures/columns/sprayPrograms"

export function SprayProgramsTable() {
  const [search, setSearch] = useState("")

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["dashboard-spray-programs", { p: pagination.pageIndex + 1, search }],
    queryFn: () =>
      querySprayPrograms({
        p: pagination.pageIndex + 1,
        search: search,
      }),
    refetchOnWindowFocus: false
  })

  const programs = data?.data?.data as SprayProgram[]
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
        context: "spray programs"
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
        <Placeholder.Title>Error Fetching Spray Programs</Placeholder.Title>
        <Placeholder.Description>
          Error fetching spray programs from the database
        </Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching Spray Programs</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={sprayProgramColumns}
      data={programs}
      newUrl="/dashboard/spray-programs/new"
      tableName="Spray Program"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
