"use client"

import { useEffect, useRef, useState } from "react"
import { PaginationState } from "@tanstack/react-table"
import { useQuery } from "@tanstack/react-query"

import { querySubscriptionPlans } from "@/lib/query"
import { RestaurantSubscriptionPlan } from "@/lib/schemas"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { subscriptionPlanColumns } from "@/components/structures/columns/subscription-plans"

export function SubscriptionPlansTable() {
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [search, setSearch] = useState("")

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["dashboard-subscription-plans"],
    queryFn: () => querySubscriptionPlans(),
    refetchOnWindowFocus: false,
  })

  const plans = data?.data as RestaurantSubscriptionPlan[]
  const total = plans?.length ?? 0

  const hasShownError = useRef(false)
  useEffect(() => {
    if (isError && !hasShownError.current) {
      hasShownError.current = true
      handleFetchError(error, {
        onRetry: () => {
          hasShownError.current = false
          refetch()
        },
        context: "subscription plans",
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
        <Placeholder.Title>Error Fetching Plans</Placeholder.Title>
        <Placeholder.Description>
          Error fetching subscription plans from the database
        </Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching Plans</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={subscriptionPlanColumns}
      data={plans ?? []}
      newUrl="/dashboard/restaurants/subscription-plans/new"
      tableName="Plan"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
