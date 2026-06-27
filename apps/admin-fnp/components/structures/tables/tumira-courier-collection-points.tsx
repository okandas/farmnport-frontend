"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryTumiraCourierCollectionPoints, queryTumiraCouriers } from "@/lib/query"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { TableSkeleton } from "@/components/state/skeleton-table"
import { DataTable } from "@/components/structures/data-table"
import { DataTableFacetedFilter } from "@/components/structures/filters/data-table-faceted-filter"
import { tumiraCourierCollectionPointColumns, TumiraCourierCollectionPoint } from "@/components/structures/columns/tumira-courier-collection-points"

export function TumiraCourierCollectionPointsTable() {
  const [search, setSearch] = useState("")
  const [courierFilter, setCourierFilter] = useState<Set<string>>(new Set())
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [courierFilter])

  const { data: couriersData } = useQuery({
    queryKey: ["tumira-couriers-all"],
    queryFn: () => queryTumiraCouriers({ limit: 100 }),
    refetchOnWindowFocus: false,
  })
  const couriers = (couriersData?.data?.data as { id: string; name: string }[]) || []
  const courierOptions = couriers.map((c) => ({ label: c.name, value: c.id }))

  const courierID = Array.from(courierFilter)[0]

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["tumira-courier-collection-points", { p: pagination.pageIndex + 1, courier_id: courierID }],
    queryFn: () => queryTumiraCourierCollectionPoints({ p: pagination.pageIndex + 1, courier_id: courierID || undefined }),
    refetchOnWindowFocus: false,
  })

  const rows = (data?.data?.data as TumiraCourierCollectionPoint[]) || []
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
        context: "courier collection points",
      })
    }
    if (!isError) hasShownError.current = false
  }, [isError, error, refetch])

  if (isError) {
    return (
      <Placeholder>
        <Placeholder.Icon name="close" />
        <Placeholder.Title>Error Fetching Courier Collection Points</Placeholder.Title>
        <Placeholder.Description>Error fetching courier collection points from Tumira</Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return <TableSkeleton />
  }

  return (
    <DataTable
      columns={tumiraCourierCollectionPointColumns}
      data={rows}
      tableName="Courier Collection Point"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
      filters={
        <DataTableFacetedFilter
          title="Courier"
          options={courierOptions}
          selectedValues={courierFilter}
          onValueChange={setCourierFilter}
        />
      }
    />
  )
}
