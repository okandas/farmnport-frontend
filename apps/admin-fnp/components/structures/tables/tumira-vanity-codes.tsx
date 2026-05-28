"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryTumiraVanityCodes } from "@/lib/query"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { tumiraVanityCodeColumns, TumiraVanityCode } from "@/components/structures/columns/tumira-vanity-codes"

export function TumiraVanityCodesTable() {
  const [search, setSearch] = useState("")
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["tumira-vanity-codes", { p: pagination.pageIndex + 1, search }],
    queryFn: () => queryTumiraVanityCodes({ p: pagination.pageIndex + 1, search }),
    refetchOnWindowFocus: false,
  })

  const codes = (data?.data?.data as TumiraVanityCode[]) || []
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
        context: "vanity codes",
      })
    }
    if (!isError) hasShownError.current = false
  }, [isError, error, refetch])

  if (isError) {
    return (
      <Placeholder>
        <Placeholder.Icon name="close" />
        <Placeholder.Title>Error Fetching Vanity Codes</Placeholder.Title>
        <Placeholder.Description>Error fetching vanity codes from Tumira</Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching Vanity Codes</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={tumiraVanityCodeColumns}
      data={codes}
      tableName="Vanity Code"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
