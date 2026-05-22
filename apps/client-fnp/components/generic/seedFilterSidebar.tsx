"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { capitalizeFirstLetter } from "@/lib/utilities"
import { Checkbox } from "@/components/ui/checkbox"
import { useQueryStates, parseAsArrayOf, parseAsString } from "nuqs"
import { Filter, X, Search } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useQuery } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import { querySeedProductFilterAggregates } from "@/lib/query"

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
  isLoading,
}: {
  items: FilterItem[]
  filterKey: string
  selectedItems: string[]
  onToggle: (value: string) => void
  title: string
  isLoading: boolean
}) {
  const [search, setSearch] = useState("")

  const filteredItems = useMemo(() => {
    if (!search) return items
    const searchLower = search.toLowerCase()
    return items.filter(item => (item.name || item._id).toLowerCase().includes(searchLower))
  }, [items, search])

  if (isLoading) return <p className="text-sm text-muted-foreground py-2">Loading...</p>
  if (!items || items.length === 0) return <p className="text-sm text-muted-foreground py-2">No {title.toLowerCase()} available</p>

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
      <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
        {filteredItems.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No results found</p>
        ) : (
          filteredItems.map((item) => {
            const displayName = item.name || item._id
            const value = item._id
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
                  className="text-sm font-medium leading-none cursor-pointer flex-1 flex items-center justify-between"
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

function FilterContent({ onClearAll }: { onClearAll: () => void }) {
  const [queryState, setQueryState] = useQueryStates({
    brand: parseAsArrayOf(parseAsString),
  })

  const { data: aggregateData, isLoading } = useQuery({
    queryKey: ["seed-product-filter-aggregates"],
    queryFn: () => querySeedProductFilterAggregates().then((r) => r.data),
  })

  const brandItems: FilterItem[] = useMemo(() => aggregateData?.brands || [], [aggregateData])

  const handleToggle = (value: string) => {
    const current = queryState.brand || []
    const next = current.includes(value) ? current.filter(v => v !== value) : [...current, value]
    setQueryState({ brand: next.length > 0 ? next : null })
  }

  const totalFilters = queryState.brand?.length || 0

  return (
    <div className="flex flex-col h-full">
      {totalFilters > 0 && (
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <span className="text-sm text-muted-foreground">
            {totalFilters} filter{totalFilters !== 1 ? "s" : ""} applied
          </span>
          <Button variant="ghost" size="sm" onClick={onClearAll} className="h-8 px-2 lg:px-3">
            Clear all <X className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      <Accordion type="multiple" className="w-full flex-1" defaultValue={["Brands"]}>
        <AccordionItem value="Brands">
          <AccordionTrigger>
            <div className="flex items-center justify-between w-full pr-2">
              <span>Brands</span>
              {(queryState.brand?.length ?? 0) > 0 && (
                <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                  {queryState.brand!.length}
                </span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <SearchableCheckboxList
              items={brandItems}
              filterKey="brand"
              selectedItems={queryState.brand || []}
              onToggle={handleToggle}
              title="Brands"
              isLoading={isLoading}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

export function SeedFilterSidebar() {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [, setQueryState] = useQueryStates({ brand: parseAsArrayOf(parseAsString) })

  const handleClearAll = () => setQueryState({ brand: null })

  if (isDesktop) {
    return (
      <div>
        <FilterContent onClearAll={handleClearAll} />
      </div>
    )
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full mb-4">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>Filter Seeds</SheetTitle>
        </SheetHeader>
        <FilterContent onClearAll={handleClearAll} />
      </SheetContent>
    </Sheet>
  )
}
