"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryTumiraCouriers } from "@/lib/query"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { tumiraCourierColumns, TumiraCourier } from "@/components/structures/columns/tumira-couriers"

export function TumiraCouriersTable() {
  const [search, setSearch] = useState("")
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["tumira-couriers", { p: pagination.pageIndex + 1, search }],
    queryFn: () => queryTumiraCouriers({ p: pagination.pageIndex + 1, search }),
    refetchOnWindowFocus: false,
  })

  const couriers = (data?.data?.data as TumiraCourier[]) || []
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
        context: "couriers",
      })
    }
    if (!isError) hasShownError.current = false
  }, [isError, error, refetch])

  if (isError) {
    return (
      <Placeholder>
        <Placeholder.Icon name="close" />
        <Placeholder.Title>Error Fetching Couriers</Placeholder.Title>
        <Placeholder.Description>Error fetching couriers from Tumira</Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching Couriers</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={tumiraCourierColumns}
      data={couriers}
      newUrl="/dashboard/tumira/couriers/new"
      tableName="Courier"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
