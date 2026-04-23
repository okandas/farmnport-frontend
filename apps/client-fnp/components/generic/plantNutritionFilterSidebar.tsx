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
import { queryPlantNutritionFilterAggregates } from "@/lib/query"
import { sendGTMEvent } from "@next/third-parties/google"

interface FilterItem {
  _id: string
  name?: string
  count: number
}

interface PlantNutritionFilterAggregates {
  used_on: FilterItem[]
  brands: FilterItem[]
  categories: FilterItem[]
  active_ingredients: FilterItem[]
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

  const filteredItems = useMemo(() => {
    if (!search) return items
    const searchLower = search.toLowerCase()
    return items.filter(item => {
      const displayName = item.name || item._id
      return displayName.toLowerCase().includes(searchLower)
    })
  }, [items, search])

  if (isLoading) {
    return <p className="text-sm text-muted-foreground py-2">Loading...</p>
  }

  if (!items || items.length === 0) {
    return <p className="text-sm text-muted-foreground py-2">No {title.toLowerCase()} available</p>
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

function FilterContent({ onClearAll }: { onClearAll: () => void }) {
  const [queryState, setQueryState] = useQueryStates({
    brand: parseAsArrayOf(parseAsString),
    category: parseAsArrayOf(parseAsString),
    active_ingredient: parseAsArrayOf(parseAsString),
    used_on: parseAsArrayOf(parseAsString),
  })

  const { data: aggregateData, isLoading: isLoadingAggregates } = useQuery({
    queryKey: ["plant-nutrition-filter-aggregates"],
    queryFn: async () => {
      const response = await queryPlantNutritionFilterAggregates()
      return response.data as PlantNutritionFilterAggregates
    },
  })

  const usedOnItems = useMemo(() => aggregateData?.used_on || [], [aggregateData])
  const brandItems = useMemo(() => aggregateData?.brands || [], [aggregateData])
  const categoryItems = useMemo(() => aggregateData?.categories || [], [aggregateData])
  const activeIngredientItems = useMemo(() => aggregateData?.active_ingredients || [], [aggregateData])

  const handleToggle = (filterKey: string, value: string) => {
    const currentValues = (queryState as any)[filterKey] || []
    const isAdding = !currentValues.includes(value)
    const newValues = isAdding
      ? [...currentValues, value]
      : currentValues.filter((v: string) => v !== value)

    sendGTMEvent({ event: 'filter', value: `${isAdding ? 'Add' : 'Remove'}PlantNutrition${filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}Filter` })

    setQueryState({ [filterKey]: newValues.length > 0 ? newValues : null } as any)
  }

  const totalFilters = (queryState.used_on?.length || 0) + (queryState.brand?.length || 0) + (queryState.category?.length || 0) + (queryState.active_ingredient?.length || 0)

  const filterSections = [
    { name: "Used On", key: "used_on", items: usedOnItems, isLoading: isLoadingAggregates },
    { name: "Brands", key: "brand", items: brandItems, isLoading: isLoadingAggregates },
    { name: "Categories", key: "category", items: categoryItems, isLoading: isLoadingAggregates },
    { name: "Active Ingredients", key: "active_ingredient", items: activeIngredientItems, isLoading: isLoadingAggregates },
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

      <Accordion type="multiple" className="w-full flex-1" defaultValue={["Used On", "Brands", "Categories", "Active Ingredients"]}>
        {filterSections.map((section) => {
          const selectedFilters = (queryState as any)[section.key] || []
          return (
            <AccordionItem value={section.name} key={section.key}>
              <AccordionTrigger>
                <div className="flex items-center justify-between w-full pr-2">
                  <span>{section.name}</span>
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

export function PlantNutritionFilterSidebar() {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [, setQueryState] = useQueryStates({
    used_on: parseAsArrayOf(parseAsString),
    brand: parseAsArrayOf(parseAsString),
    category: parseAsArrayOf(parseAsString),
    active_ingredient: parseAsArrayOf(parseAsString),
  })

  const handleClearAll = () => {
    setQueryState({ used_on: null, brand: null, category: null, active_ingredient: null })
  }

  if (isDesktop) {
    return (
      <div className="sticky top-20 mt-[20px] max-h-[calc(100vh-5rem)] overflow-y-auto">
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
          <SheetTitle>Filter Plant Nutrition Products</SheetTitle>
        </SheetHeader>
        <FilterContent onClearAll={handleClearAll} />
      </SheetContent>
    </Sheet>
  )
}
