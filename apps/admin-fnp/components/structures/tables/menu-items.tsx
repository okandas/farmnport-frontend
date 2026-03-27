"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"
import { useDebounce } from "use-debounce"

import { queryMenuItems } from "@/lib/query"
import { MenuItem } from "@/lib/schemas"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { menuItemColumns } from "@/components/structures/columns/menu-items"

export function MenuItemsTable() {
  const [search, setSearch] = useState("")
  const [debouncedSearch] = useDebounce(search, 500)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["dashboard-menu-items", { p: pagination.pageIndex + 1, search: debouncedSearch }],
    queryFn: () =>
      queryMenuItems({
        p: pagination.pageIndex + 1,
        search: debouncedSearch,
      }),
    refetchOnWindowFocus: false
  })

  const menuItems = data?.data?.data as MenuItem[]
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
        context: "menu items"
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
        <Placeholder.Title>Error Fetching Menu Items</Placeholder.Title>
        <Placeholder.Description>
          Error fetching menu items from the database
        </Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching Menu Items</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={menuItemColumns}
      data={menuItems}
      newUrl="/dashboard/restaurants/menu-items/new"
      tableName="Menu Item"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
