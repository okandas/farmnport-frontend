"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryMenus } from "@/lib/query"
import { Menu } from "@/lib/schemas"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { menuColumns } from "@/components/structures/columns/menus"

export function MenusTable() {
  const [search, setSearch] = useState("")

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["dashboard-menus", { p: pagination.pageIndex + 1, search }],
    queryFn: () =>
      queryMenus({
        p: pagination.pageIndex + 1,
        search: search,
      }),
    refetchOnWindowFocus: false
  })

  const menus = data?.data?.data as Menu[]
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
        context: "menus"
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
        <Placeholder.Title>Error Fetching Menus</Placeholder.Title>
        <Placeholder.Description>
          Error fetching menus from the database
        </Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching Menus</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={menuColumns}
      data={menus}
      newUrl="/dashboard/restaurants/menus/new"
      tableName="Menu"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
