"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"
import { useDebounce } from "use-debounce"

import { queryMenuItems, queryMenus } from "@/lib/query"
import { MenuItem, Menu } from "@/lib/schemas"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { TableSkeleton } from "@/components/state/skeleton-table"
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

  const { data: menuData } = useQuery({
    queryKey: ["menus-all"],
    queryFn: () => queryMenus({ p: 1 }),
    refetchOnWindowFocus: false,
  })

  const menus = (menuData?.data?.data as Menu[]) || []

  const rawMenuItems = data?.data?.data as MenuItem[]
  const total = data?.data?.total as number

  const menuItems = rawMenuItems?.map(item => {
    const menu = menus.find(m => m.id === item.menu_id)
    const locationNames = menu?.locations?.map(l => l.location_name) || []
    return { ...item, location_names: locationNames }
  })

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
    return <TableSkeleton />
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
