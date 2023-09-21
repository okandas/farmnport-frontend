"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"
import { AxiosError, AxiosResponse, isAxiosError } from "axios"

import { queryProducerPriceListsAsAdmin } from "@/lib/query"
import { ProducerPriceList } from "@/lib/schemas"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { producerPriceListColumns } from "@/components/structures/producerLists"

export function AdminProducePriceLists() {
  const [adminProducePriceLists, setAdminProducePriceLists] = useState<
    ProducerPriceList[]
  >([])
  const [searchClient, setSearchClient] = useState("")

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 20,
  })

  const [total, setTotal] = useState(0)

  const { isError, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      "dashboard-admin-producer-price-lists",
      { p: pagination.pageIndex },
    ],
    queryFn: () =>
      queryProducerPriceListsAsAdmin({
        p: pagination.pageIndex,
      }),
    onSuccess(data: AxiosResponse) {
      setAdminProducePriceLists(data?.data?.data)
      setTotal(data?.data?.total)
    },
    onError(error: AxiosError) {
      if (isAxiosError(error)) {
        switch (error.code) {
          case "ERR_NETWORK":
            toast({
              description: "There seems to be a network error.",
              action: <ToastAction altText="Try again">Try again</ToastAction>,
            })
            break

          default:
            toast({
              title: "Uh oh! Failed to fetch clients.",
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
    },
  })

  if (isError) {
    return (
      <Placeholder>
        <Placeholder.Icon name="close" />
        <Placeholder.Title>Error Fetching Users</Placeholder.Title>
        <Placeholder.Description>
          Error Fetching users from the database
        </Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching Producer Price Lists</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={producerPriceListColumns}
      data={adminProducePriceLists}
      newUrl="/dashboard/prices/new"
      tableName="Price"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      searchClient={searchClient}
      setSearchClient={setSearchClient}
    />
  )
}
