"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"
import { isAxiosError } from "axios"

import { queryFarmProduce } from "@/lib/query"
import { FarmProduce } from "@/lib/schemas"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { farmProduceColumns } from "@/components/structures/columns/farmProduce"

export function FarmProduceTable() {
  const [search, setSearch] = useState("")

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 20,
  })

  const { isError, isLoading, isFetching, refetch, data } = useQuery({
    queryKey: ["dashboard-farm-produce", { p: pagination.pageIndex, search }],
    queryFn: () =>
      queryFarmProduce({
        p: pagination.pageIndex,
        search: search,
      }),
    refetchOnWindowFocus: false
  })

  const items = data?.data?.data as FarmProduce[]
  const total = data?.data?.total as number

  if (isError) {
    if (isAxiosError(data)) {
      switch (data.code) {
        case "ERR_NETWORK":
          toast({
            description: "There seems to be a network error.",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          })
          break

        default:
          toast({
            title: "Uh oh! Failed to fetch farm produce.",
            description: "There was a problem with your request.",
            action: (
              <ToastAction altText="Try again" onClick={() => refetch()}>
                Try again
              </ToastAction>
            ),
          })
          break
      }
    }
    return (
      <Placeholder>
        <Placeholder.Icon name="close" />
        <Placeholder.Title>Error Fetching Farm Produce</Placeholder.Title>
        <Placeholder.Description>
          Error fetching farm produce from the database
        </Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching Farm Produce</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={farmProduceColumns}
      data={items}
      newUrl="/dashboard/farmproduce/new"
      tableName="Farm Produce"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
