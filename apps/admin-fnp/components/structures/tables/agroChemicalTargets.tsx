"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryAgroChemicalTargets } from "@/lib/query"
import { AgroChemicalTarget } from "@/lib/schemas"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { agroChemicalTargetColumns } from "@/components/structures/columns/agroChemicalTargets"

export function AgroChemicalTargetsTable() {
  const [search, setSearch] = useState("")

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 20,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["dashboard-agrochemical-targets", { p: pagination.pageIndex, search }],
    queryFn: () =>
      queryAgroChemicalTargets({
        p: pagination.pageIndex,
        search: search,
      }),
    refetchOnWindowFocus: false
  })

  const targets = data?.data?.data as AgroChemicalTarget[]
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
        context: "agrochemical targets"
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
        <Placeholder.Title>Error Fetching Targets</Placeholder.Title>
        <Placeholder.Description>
          Error fetching agrochemical targets from the database
        </Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching Targets</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={agroChemicalTargetColumns}
      data={targets}
      newUrl="/dashboard/agrochemical-targets/new"
      tableName="AgroChemical Target"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
