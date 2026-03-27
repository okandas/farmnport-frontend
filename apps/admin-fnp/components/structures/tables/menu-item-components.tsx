"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryMenuItemComponents } from "@/lib/query"
import { MenuItemComponent } from "@/lib/schemas"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { menuItemComponentColumns } from "@/components/structures/columns/menu-item-components"

export function MenuItemComponentsTable() {
  const [search, setSearch] = useState("")

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["dashboard-menu-item-components", { p: pagination.pageIndex + 1, search }],
    queryFn: () =>
      queryMenuItemComponents({
        p: pagination.pageIndex + 1,
        search: search,
      }),
    refetchOnWindowFocus: false
  })

  const components = data?.data?.data as MenuItemComponent[]
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
        context: "menu item components"
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
        <Placeholder.Title>Error Fetching Components</Placeholder.Title>
        <Placeholder.Description>
          Error fetching menu item components from the database
        </Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching Components</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={menuItemComponentColumns}
      data={components}
      newUrl="/dashboard/restaurants/menu-item-components/new"
      tableName="Component"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
