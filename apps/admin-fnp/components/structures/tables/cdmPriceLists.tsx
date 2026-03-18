"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryCdmPrices } from "@/lib/query"
import { CdmPrice } from "@/lib/schemas"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { cdmPriceColumns } from "@/components/structures/columns/cdmPrices"

export function CdmPriceLists() {
  const [search, setSearch] = useState("")

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 20,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["dashboard-cdm-prices", { p: pagination.pageIndex }],
    queryFn: () =>
      queryCdmPrices({
        p: pagination.pageIndex,
      }),
    refetchOnWindowFocus: false
  })

  const cdmPrices: CdmPrice[] = data?.data?.data || []
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
        context: "CDM price lists"
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
        <Placeholder.Title>Error Fetching CDM Price Lists</Placeholder.Title>
        <Placeholder.Description>
          Error fetching CDM price lists from the database
        </Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching CDM Price Lists</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={cdmPriceColumns}
      data={cdmPrices}
      newUrl="/dashboard/cdm-prices/new"
      tableName="CDM Price"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
