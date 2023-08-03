"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"
import { AxiosError, AxiosResponse, isAxiosError } from "axios"

import { queryUsersAsAdmin } from "@/lib/query"
import { ApplicationUser } from "@/lib/schemas"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { Placeholder } from "@/components/state/placeholder"
import { clientColumns } from "@/components/structures/columns/clients"
import { DataTable } from "@/components/structures/components/data-table"

export function AdminClientsTable() {
  const [adminClients, setAdminClients] = useState<ApplicationUser[]>([])

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize: 10,
  })

  const [total, setTotal] = useState(0)

  const { isError, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["dashboard-admin-clients", { p: pagination.pageIndex }],
    queryFn: () => queryUsersAsAdmin({ p: pagination.pageIndex }),
    onSuccess(data: AxiosResponse) {
      setAdminClients(data?.data?.data)
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
    refetchOnWindowFocus: false,
    keepPreviousData: true,
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
        <Placeholder.Title>Fetching Users</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={clientColumns}
      data={adminClients}
      total={total}
      pagination={pagination}
      setPagination={setPagination}
    />
  )
}
