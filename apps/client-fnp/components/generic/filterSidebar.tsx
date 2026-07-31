"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { defaultSideBarData } from "@/config/data"
import { capitalizeFirstLetter } from "@/lib/utilities"
import { Checkbox } from "@/components/ui/checkbox"
import { useQueryStates, parseAsArrayOf, parseAsString } from "nuqs"
import { Filter, X, Search } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useQuery } from "@tanstack/react-query"
import { queryPriceFilterAggregates, queryClientFilterAggregates } from "@/lib/query"
import { useState, useMemo, useEffect } from "react"
import { QuickLinks } from "@/components/generic/quick-links"

interface FilterItem {
  _id: string
  name?: string
  count: number
}

function SearchableCheckboxList({
  items,
  filterKey,
  selectedItems,
  onToggle,
  title,
  isLoading
}: {
  items: FilterItem[]
  filterKey: string
  selectedItems: string[]
  onToggle: (value: string) => void
  title: string
  isLoading: boolean
}) {
  const [search, setSearch] = useState("")

  const itemsWithSelected = useMemo(() => {
    const keys = new Set(items.map(i => (i.name || i._id).toLowerCase()))
    items.forEach(i => keys.add(i._id))
    const missing = selectedItems.filter(v => !keys.has(v) && !keys.has(v.toLowerCase())).map(v => ({ _id: v, count: 0 }))
    return [...items, ...missing]
  }, [items, selectedItems])

  const filteredItems = useMemo(() => {
    if (!search) return itemsWithSelected
    const searchLower = search.toLowerCase()
    return itemsWithSelected.filter(item => {
      const displayName = item.name || item._id
      return displayName.toLowerCase().includes(searchLower)
    })
  }, [itemsWithSelected, search])

  if (isLoading) {
    return <p className="text-sm text-muted-foreground py-2">Loading...</p>
  }

  return (
    <div className="space-y-3">
      {items.length > 5 && (
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      )}
      <div className="max-h-[300px] overflow-y-auto space-y-2 pr-3">
        {filteredItems.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No results found</p>
        ) : (
          filteredItems.map((item) => {
            const displayName = item.name || item._id
            const value = displayName.toLowerCase()
            const isChecked = selectedItems.includes(value)

            return (
              <div className="flex items-start space-x-2" key={item._id}>
                <Checkbox
                  id={`${filterKey}-${value}`}
                  checked={isChecked}
                  onCheckedChange={() => onToggle(value)}
                  className="mt-0.5"
                />
                <label
                  htmlFor={`${filterKey}-${value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 flex items-center justify-between"
                >
                  <span>{capitalizeFirstLetter(displayName)}</span>
                  <span className="text-xs text-muted-foreground ml-2">({item.count})</span>
                </label>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function ClientFilterContent({
  onClearAll,
  hideProduce,
  clientType
}: {
  onClearAll: () => void
  hideProduce?: boolean
  clientType: "farmers" | "buyers"
}) {
  const [queryState, setQueryState] = useQueryStates({
    produce: parseAsString,
    category: parseAsString,
  })

  const { data: aggregateData, isLoading } = useQuery({
    queryKey: ["client-filter-aggregates", clientType, queryState.category],
    queryFn: async () => {
      const response = await queryClientFilterAggregates(clientType, {
        category: queryState.category ? [queryState.category] : [],
      })
      return response.data
    },
  })

  const produceItems: FilterItem[] = useMemo(() => aggregateData?.produce || [], [aggregateData])
  const categoryItems: FilterItem[] = useMemo(() => aggregateData?.categories || [], [aggregateData])

  const handleSelect = (filterKey: "produce" | "category", value: string) => {
    const isDeselecting = queryState[filterKey] === value
    if (filterKey === "category") {
      setQueryState({ category: isDeselecting ? null : value, produce: null })
    } else {
      setQueryState({ [filterKey]: isDeselecting ? null : value })
    }
  }

  const totalFilters = [queryState.produce, queryState.category].filter(Boolean).length

  const filterSections = [
    { name: "category", key: "category" as const, items: categoryItems },
    ...(!hideProduce ? [{ name: "produce", key: "produce" as const, items: produceItems }] : []),
  ]

  return (
    <div className="flex flex-col h-full">
      {totalFilters > 0 && (
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <span className="text-sm text-muted-foreground">
            {totalFilters} filter{totalFilters !== 1 ? 's' : ''} applied
          </span>
          <Button variant="ghost" size="sm" onClick={onClearAll} className="h-8 px-2 lg:px-3">
            Clear all
            <X className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      <Accordion type="multiple" className="w-full flex-1" defaultValue={[]}>
        {filterSections.map((section) => {
          const selected = queryState[section.key]

          return (
            <AccordionItem value={section.name} key={section.key}>
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-2">
                  <span>{capitalizeFirstLetter(section.name)}</span>
                  {selected && (
                    <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">1</span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <SearchableCheckboxList
                  items={section.items}
                  filterKey={section.key}
                  selectedItems={selected ? [selected] : []}
                  onToggle={(value) => handleSelect(section.key, value)}
                  title={section.name}
                  isLoading={isLoading}
                />
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

function FilterContent({
  onClearAll,
  hideProduce,
}: {
  onClearAll: () => void
  hideProduce?: boolean
}) {
  const [queryState, setQueryState] = useQueryStates({
    produce: parseAsArrayOf(parseAsString),
    clients: parseAsArrayOf(parseAsString),
  })

  const { data: aggregateData, isLoading: isLoadingAggregates } = useQuery({
    queryKey: ["price-filter-aggregates"],
    queryFn: async () => {
      const response = await queryPriceFilterAggregates()
      return response.data
    },
  })

  const produceItems = useMemo(() => aggregateData?.produce || [], [aggregateData])
  const clientItems = useMemo(() => aggregateData?.clients || [], [aggregateData])

  const handleToggle = (filterKey: string, value: string) => {
    const currentValues = (queryState as any)[filterKey] || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v: string) => v !== value)
      : [...currentValues, value]

    setQueryState({ [filterKey]: newValues.length > 0 ? newValues : null } as any)
  }

  const totalFilters = Object.values(queryState).reduce((acc, val) => acc + (val?.length || 0), 0)

  const filterSections = [
    ...(!hideProduce ? [{ name: "produce", key: "produce", items: produceItems, isLoading: isLoadingAggregates }] : []),
    { name: "clients", key: "clients", items: clientItems, isLoading: isLoadingAggregates },
  ]

  return (
    <div className="flex flex-col h-full">
      {totalFilters > 0 && (
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <span className="text-sm text-muted-foreground">
            {totalFilters} filter{totalFilters !== 1 ? 's' : ''} applied
          </span>
          <Button variant="ghost" size="sm" onClick={onClearAll} className="h-8 px-2 lg:px-3">
            Clear all
            <X className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      <Accordion type="multiple" className="w-full flex-1" defaultValue={[]}>
        {filterSections.map((section) => {
          const selectedFilters = (queryState as any)[section.key] || []

          return (
            <AccordionItem value={section.name} key={section.key}>
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-2">
                  <span>{capitalizeFirstLetter(section.name)}</span>
                  {selectedFilters.length > 0 && (
                    <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                      {selectedFilters.length}
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <SearchableCheckboxList
                  items={section.items}
                  filterKey={section.key}
                  selectedItems={selectedFilters}
                  onToggle={(value) => handleToggle(section.key, value)}
                  title={section.name}
                  isLoading={section.isLoading}
                />
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

export function FilterSidebar({ hideProduce, clientType }: { hideProduce?: boolean, clientType?: "farmers" | "buyers" } = {}) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [priceQueryState, setPriceQueryState] = useQueryStates({
    produce: parseAsArrayOf(parseAsString),
    clients: parseAsArrayOf(parseAsString),
  })
  const [clientQueryState, setClientQueryState] = useQueryStates({
    produce: parseAsString,
    category: parseAsString,
  })

  const handleClearAll = () => {
    if (clientType) {
      setClientQueryState({ produce: null, category: null })
    } else {
      setPriceQueryState({ produce: null, clients: null })
    }
  }

  const [open, setOpen] = useState(false)
  useEffect(() => { setOpen(false) }, [priceQueryState.produce, priceQueryState.clients, clientQueryState.produce, clientQueryState.category])

  const content = clientType
    ? <ClientFilterContent onClearAll={handleClearAll} hideProduce={hideProduce} clientType={clientType} />
    : <FilterContent onClearAll={handleClearAll} hideProduce={hideProduce} />

  if (isDesktop) {
    return (
      <div className="space-y-6">
        {content}
      </div>
    )
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Filter {clientType ? capitalizeFirstLetter(clientType) : "Prices"}</SheetTitle>
        </SheetHeader>
        {content}
      </SheetContent>
    </Sheet>
  )
}
