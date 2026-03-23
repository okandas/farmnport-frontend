"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryProducerPriceLists } from "@/lib/query"
import { ProducerPriceList } from "@/lib/schemas"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { producerPriceListColumns } from "@/components/structures/columns/producerLists"

export function ProducePriceLists() {
  const [search, setSearch] = useState("")

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["dashboard-producer-price-lists", { p: pagination.pageIndex + 1, search }],
    queryFn: () =>
      queryProducerPriceLists({
        p: pagination.pageIndex + 1,
        search: search,
      }),
    refetchOnWindowFocus: false
  })

  const producePriceLists: ProducerPriceList[] = data?.data?.data || []
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
        context: "producer price lists"
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
        <Placeholder.Title>Error Fetching Producer Price Lists</Placeholder.Title>
        <Placeholder.Description>
          Error fetching producer price lists from the database
        </Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching Producer Price Lists</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={producerPriceListColumns}
      data={producePriceLists}
      newUrl="/dashboard/prices/new"
      tableName="Price"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
