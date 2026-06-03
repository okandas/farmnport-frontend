"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryTumiraGeocodedAddresses } from "@/lib/query"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { tumiraGeocodedAddressColumns, TumiraGeocodedAddress } from "@/components/structures/columns/tumira-geocoded-addresses"

export function TumiraGeocodedAddressesTable() {
  const [search, setSearch] = useState("")
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["tumira-geocoded-addresses", { p: pagination.pageIndex + 1, search }],
    queryFn: () => queryTumiraGeocodedAddresses({ p: pagination.pageIndex + 1, search }),
    refetchOnWindowFocus: false,
  })

  const addrs = (data?.data?.data as TumiraGeocodedAddress[]) || []
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
        context: "geocoded addresses",
      })
    }
    if (!isError) hasShownError.current = false
  }, [isError, error, refetch])

  if (isError) {
    return (
      <Placeholder>
        <Placeholder.Icon name="close" />
        <Placeholder.Title>Error Fetching Geocoded Addresses</Placeholder.Title>
        <Placeholder.Description>Could not load geocoded addresses from Tumira</Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching Geocoded Addresses</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={tumiraGeocodedAddressColumns}
      data={addrs}
      tableName="Address"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
