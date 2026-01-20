"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"
import { isAxiosError } from "axios"
import { useDebounce } from "use-debounce"

import { queryBuyerContacts, queryUsers } from "@/lib/query"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { Placeholder } from "@/components/state/placeholder"
import { buyerContactsColumns } from "@/components/structures/columns/buyerContacts"
import { DataTable } from "@/components/structures/data-table"
import { DataTableFacetedFilter } from "@/components/structures/filters/data-table-faceted-filter"
import { DataTableClientSearch } from "@/components/structures/filters/data-table-client-search"

export function BuyerContactsList() {
  const [clientId, setClientId] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set())

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const [debouncedClientId] = useDebounce(clientId, 500)

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [statusFilter, debouncedClientId])

  const { isError, isLoading, isFetching, refetch, data} = useQuery({
    queryKey: ["dashboard-buyer-contacts", { p: pagination.pageIndex + 1, client_id: debouncedClientId, status: Array.from(statusFilter)[0] }],
    queryFn: () =>
      queryBuyerContacts({
        p: pagination.pageIndex + 1,
        client_id: debouncedClientId || undefined,
        status: Array.from(statusFilter)[0] || undefined
      }),
    refetchOnWindowFocus: false
  })

  const buyerContacts = data?.data?.data || []
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
            title: "Uh oh! Failed to fetch buyer contacts.",
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
        <Placeholder.Title>Error Fetching Buyer Contacts</Placeholder.Title>
        <Placeholder.Description>
          Error fetching buyer contacts from the database
        </Placeholder.Description>
      </Placeholder>
    )
  }

  const statusOptions = [
    { label: "Active", value: "active" },
    { label: "Archived", value: "archived" },
    { label: "Banned", value: "banned" },
  ]

  return (
    <DataTable
      columns={buyerContactsColumns}
      data={buyerContacts}
      newUrl="/dashboard/buyer-contacts/new"
      tableName="Buyer Contact"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      filters={
        <div className="flex gap-2">
          <DataTableClientSearch
            selectedClientId={clientId}
            onClientChange={setClientId}
          />
          <DataTableFacetedFilter
            title="Status"
            options={statusOptions}
            selectedValues={statusFilter}
            onValueChange={setStatusFilter}
          />
        </div>
      }
    />
  )
}
