"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"
import { isAxiosError } from "axios"

import { queryUsers } from "@/lib/query"
import { ApplicationUser } from "@/lib/schemas"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { Placeholder } from "@/components/state/placeholder"
import { clientColumns } from "@/components/structures/clients"
import { DataTable } from "@/components/structures/data-table"

export function ClientsTable() {
  const [searchClient, setSearchClient] = useState("")

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 20,
  })

  const { isError, isLoading, isFetching, refetch, data } = useQuery({
    queryKey: ["dashboard-clients", { p: pagination.pageIndex }],
    queryFn: () =>
      queryUsers({
        p: pagination.pageIndex,
      }),
  })

  const clients = data?.data?.data as ApplicationUser[]
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
        <Placeholder.Title>Fetching Users</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={clientColumns}
      data={clients}
      newUrl="/dashboard/users/new"
      tableName="User"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      searchClient={searchClient}
      setSearchclient={setSearchClient}
    />
  )
}
