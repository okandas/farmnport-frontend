"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"
import { isAxiosError } from "axios"

import { queryBrands } from "@/lib/query"
import { Brand } from "@/lib/schemas"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { brandColumns } from "@/components/structures/columns/brands"

export function BrandsTable() {
  const [search, setSearch] = useState("")

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 20,
  })

  const { isError, isLoading, isFetching, refetch, data } = useQuery({
    queryKey: ["dashboard-brands", { p: pagination.pageIndex, search }],
    queryFn: () =>
      queryBrands({
        p: pagination.pageIndex,
        search: search,
      }),
    refetchOnWindowFocus: false
  })

  const brands = data?.data?.data as Brand[]
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
            title: "Uh oh! Failed to fetch brands.",
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
        <Placeholder.Title>Error Fetching Brands</Placeholder.Title>
        <Placeholder.Description>
          Error fetching brands from the database
        </Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Fetching Brands</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={brandColumns}
      data={brands}
      newUrl="/dashboard/brands/new"
      tableName="Brand"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
    />
  )
}
