"use client"

import { useEffect, useRef, useState } from "react"
import { PaginationState } from "@tanstack/react-table"
import { useQuery } from "@tanstack/react-query"

import { queryRestaurantSubscriptions } from "@/lib/query"
import { RestaurantSubscription } from "@/lib/schemas"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { restaurantSubscriptionColumns } from "@/components/structures/columns/restaurant-subscriptions"

export function RestaurantSubscriptionsTable() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [search, setSearch] = useState("")

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["dashboard-restaurant-subscriptions", pagination.pageIndex],
    queryFn: () => queryRestaurantSubscriptions({ p: pagination.pageIndex + 1 }),
    refetchOnWindowFocus: false,
  })

  const items = data?.data?.data as RestaurantSubscription[]
  const total = (data?.data?.total as number) ?? 0

  const hasShownError = useRef(false)
  useEffect(() => {
    if (isError && !hasShownError.current) {
      hasShownError.current = true
      handleFetchError(error, {
        onRetry: () => {
          hasShownError.current = false
          refetch()
        },
        context: "restaurant subscriptions",
      })
    }
    if (!isError) hasShownError.current = false
  }, [isError, error, refetch])

  if (isError) {
    return (
      <Placeholder>
        <Placeholder.Icon name="close" />
        <Placeholder.Title>Error Fetching Subscriptions</Placeholder.Title>
        <Placeholder.Description>Error fetching restaurant subscriptions</Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching Subscriptions</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={restaurantSubscriptionColumns}
      data={items ?? []}
      newUrl="/dashboard/restaurants/subscriptions/new"
      tableName="Subscription"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
