"use client"

import { useState, useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"
import { isAxiosError } from "axios"
import { useDebounce } from "use-debounce"

import { queryUsers, queryFarmProduceCategories, queryAllFarmProduce } from "@/lib/query"
import { ApplicationUser, FarmProduceCategoriesResponse, FarmProduceResponse } from "@/lib/schemas"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { Placeholder } from "@/components/state/placeholder"
import { clientColumns } from "@/components/structures/columns/clients"
import { DataTable } from "@/components/structures/data-table"
import { DataTableFacetedFilter } from "@/components/structures/filters/data-table-faceted-filter"

export function ClientsTable() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set())
  const [categoryFilter, setCategoryFilter] = useState<Set<string>>(new Set())
  const [produceFilter, setProduceFilter] = useState<Set<string>>(new Set())

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const [debouncedSearchQuery] = useDebounce(search, 1000)

  // Fetch categories and produce for filter options
  const { data: categoriesData } = useQuery({
    queryKey: ["filter-categories"],
    queryFn: () => queryFarmProduceCategories(),
    refetchOnWindowFocus: false,
  })

  const { data: produceData } = useQuery({
    queryKey: ["filter-produce"],
    queryFn: () => queryAllFarmProduce(),
    refetchOnWindowFocus: false,
  })

  const categoryOptions = useMemo(() => {
    const categories = (categoriesData?.data as FarmProduceCategoriesResponse)?.data || []
    return categories.map((c) => ({ label: c.name, value: c.slug }))
  }, [categoriesData])

  const produceOptions = useMemo(() => {
    const produce = (produceData?.data as FarmProduceResponse)?.data || []
    return produce.map((p) => ({ label: p.name, value: p.slug }))
  }, [produceData])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [typeFilter, categoryFilter, produceFilter, debouncedSearchQuery])

  const { isError, isLoading, isFetching, refetch, data} = useQuery({
    queryKey: ["dashboard-clients", {
      p: pagination.pageIndex + 1,
      search: debouncedSearchQuery,
      type: Array.from(typeFilter),
      category: Array.from(categoryFilter),
      produce: Array.from(produceFilter),
    }],
    queryFn: () =>
      queryUsers({
        p: pagination.pageIndex + 1,
        search: debouncedSearchQuery,
        type: Array.from(typeFilter),
        category: Array.from(categoryFilter),
        produce: Array.from(produceFilter),
      }),
    refetchOnWindowFocus: false
  })

  const clients = data?.data?.data as ApplicationUser[] || []
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

  const userTypeOptions = [
    { label: "Buyer", value: "buyer" },
    { label: "Farmer", value: "farmer" },
  ]

  return (
    <DataTable
      columns={clientColumns}
      data={clients}
      newUrl="/dashboard/farmnport/users/new"
      tableName="Client"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
      filters={
        <>
          <DataTableFacetedFilter
            title="Type"
            options={userTypeOptions}
            selectedValues={typeFilter}
            onValueChange={setTypeFilter}
          />
          <DataTableFacetedFilter
            title="Category"
            options={categoryOptions}
            selectedValues={categoryFilter}
            onValueChange={setCategoryFilter}
          />
          <DataTableFacetedFilter
            title="Main Produce"
            options={produceOptions}
            selectedValues={produceFilter}
            onValueChange={setProduceFilter}
          />
        </>
      }
    />
  )
}
