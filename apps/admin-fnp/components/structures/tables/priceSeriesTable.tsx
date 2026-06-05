"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { PaginationState } from "@tanstack/react-table"

import { queryPriceSeries } from "@/lib/query"
import { handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { DataTable } from "@/components/structures/data-table"
import { priceSeriesColumns, PriceSeriesEntry } from "@/components/structures/columns/priceSeries"
import { DataTableFacetedFilter } from "@/components/structures/filters/data-table-faceted-filter"
import { DataTableClientSearch } from "@/components/structures/filters/data-table-client-search"

const templateOptions = [
  { label: "CDM", value: "cdm" },
  { label: "LWT", value: "lwt" },
]

const categoryOptions = [
  { label: "BEEF", value: "BEEF" },
  { label: "CATTLE", value: "CATTLE" },
  { label: "LAMB", value: "LAMB" },
  { label: "MUTTON", value: "MUTTON" },
  { label: "GOAT", value: "GOAT" },
  { label: "CHICKENS", value: "CHICKENS" },
  { label: "PORK", value: "PORK" },
  { label: "PIGS", value: "PIGS" },
  { label: "BREEDING", value: "BREEDING" },
  { label: "COMMUNAL", value: "COMMUNAL" },
  { label: "HEIFER", value: "HEIFER" },
  { label: "STEER", value: "STEER" },
  { label: "SHEEP", value: "SHEEP" },
  { label: "BORAN", value: "BORAN" },
  { label: "BRAHMAN", value: "BRAHMAN" },
  { label: "SIMBRA", value: "SIMBRA" },
  { label: "TULI", value: "TULI" },
]

type Props = {
  refreshKey?: number
}

export function PriceSeriesTable({ refreshKey }: Props) {
  const [search, setSearch] = useState("")
  const [clientId, setClientId] = useState("")
  const [templateFilter, setTemplateFilter] = useState<Set<string>>(new Set())
  const [categoryFilter, setCategoryFilter] = useState<Set<string>>(new Set())
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [clientId, templateFilter, categoryFilter])

  const { isError, isLoading, isFetching, refetch, data, error } = useQuery({
    queryKey: ["price-series", refreshKey, clientId, Array.from(templateFilter)[0], Array.from(categoryFilter)[0], search],
    queryFn: () =>
      queryPriceSeries({
        client_id: clientId || undefined,
        template_type: Array.from(templateFilter)[0] || undefined,
        category: Array.from(categoryFilter)[0] || undefined,
        search: search || undefined,
      }),
    refetchOnWindowFocus: false,
  })

  const entries: PriceSeriesEntry[] = data?.data?.data ?? []
  const total: number = data?.data?.total ?? 0

  const hasShownError = useRef(false)
  useEffect(() => {
    if (isError && !hasShownError.current) {
      hasShownError.current = true
      handleFetchError(error, {
        onRetry: () => {
          hasShownError.current = false
          refetch()
        },
        context: "price series",
      })
    }
    if (!isError) hasShownError.current = false
  }, [isError, error, refetch])

  if (isError) {
    return (
      <Placeholder>
        <Placeholder.Icon name="close" />
        <Placeholder.Title>Error loading price series</Placeholder.Title>
        <Placeholder.Description>Could not fetch entries from the database.</Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Loading price series...</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <DataTable
      columns={priceSeriesColumns}
      data={entries}
      tableName="Price Series"
      total={total}
      pagination={pagination}
      setPagination={setPagination}
      search={search}
      setSearch={setSearch}
      searchPlaceholder="Search by grade or code..."
      filters={
        <div className="flex items-center gap-2 flex-wrap">
          <DataTableClientSearch
            selectedClientId={clientId}
            onClientChange={setClientId}
          />
          <DataTableFacetedFilter
            title="Type"
            options={templateOptions}
            selectedValues={templateFilter}
            onValueChange={setTemplateFilter}
          />
          <DataTableFacetedFilter
            title="Category"
            options={categoryOptions}
            selectedValues={categoryFilter}
            onValueChange={setCategoryFilter}
          />
        </div>
      }
    />
  )
}
