"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryTumiraCourierRates } from "@/lib/query"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { tumiraCourierRateColumns, TumiraCourierRate } from "@/components/structures/columns/tumira-courier-rates"

export function TumiraCourierRatesTable() {
  const [search, setSearch] = useState("")
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["tumira-courier-rates", { p: pagination.pageIndex + 1, search }],
    queryFn: () => queryTumiraCourierRates({ p: pagination.pageIndex + 1, search }),
    refetchOnWindowFocus: false,
  })

  const rates = (data?.data?.data as TumiraCourierRate[]) || []
  const total = (data?.data?.total as number) || 0

  const hasShownError = useRef(false)
  useEffect(() => {
    if (isError && !hasShownError.current) {
      hasShownError.current = true
      handleFetchError(error, {
        onRetry: () => {
          hasShownError.current = false
          refetch()
        },
        context: "courier rates",
      })
    }
    if (!isError) hasShownError.current = false
  }, [isError, error, refetch])

  if (isError) {
    return (
      <Placeholder>
        <Placeholder.Icon name="close" />
        <Placeholder.Title>Error Fetching Courier Rates</Placeholder.Title>
        <Placeholder.Description>Error fetching courier rates from Tumira</Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching Courier Rates</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={tumiraCourierRateColumns}
      data={rates}
      tableName="Courier Rate"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
