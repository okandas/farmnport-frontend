"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryMenuItemCategories } from "@/lib/query"
import { MenuItemCategory } from "@/lib/schemas"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { menuItemCategoryColumns } from "@/components/structures/columns/menu-item-categories"

export function MenuItemCategoriesTable() {
  const [search, setSearch] = useState("")

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["dashboard-menu-item-categories", { p: pagination.pageIndex + 1, search }],
    queryFn: () =>
      queryMenuItemCategories({
        p: pagination.pageIndex + 1,
        search: search,
      }),
    refetchOnWindowFocus: false
  })

  const categories = data?.data?.data as MenuItemCategory[]
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
        context: "menu item categories"
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
        <Placeholder.Title>Error Fetching Categories</Placeholder.Title>
        <Placeholder.Description>
          Error fetching menu item categories from the database
        </Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching Categories</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={menuItemCategoryColumns}
      data={categories}
      newUrl="/dashboard/restaurants/menu-item-categories/new"
      tableName="Category"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
