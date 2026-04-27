"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { capitalizeFirstLetter } from "@/lib/utilities"
import { Checkbox } from "@/components/ui/checkbox"
import { useQueryStates, parseAsArrayOf, parseAsString, parseAsInteger } from "nuqs"
import { Filter, X, Search } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useQuery } from "@tanstack/react-query"
import { queryFeedCategories, queryFeedFilterAggregates } from "@/lib/query"
import { useState, useMemo } from "react"

interface FilterItem {
  _id: string
  name?: string
  count?: number
}

function SearchableCheckboxList({
  items,
  filterKey,
  selectedItems,
  onToggle,
  title,
  isLoading,
  useIdAsValue,
}: {
  items: FilterItem[]
  filterKey: string
  selectedItems: string[]
  onToggle: (value: string) => void
  title: string
  isLoading: boolean
  useIdAsValue?: boolean
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
      <div className="max-h-[300px] overflow-y-auto space-y-2">
        {filteredItems.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">No results found</p>
        ) : (
          filteredItems.map((item) => {
            const displayName = item.name || item._id
            const value = useIdAsValue ? item._id : displayName
            const isChecked = selectedItems.includes(value)

            return (
              <div className="flex items-start space-x-2" key={item._id}>
                <Checkbox
                  id={`${filterKey}-${item._id}`}
                  checked={isChecked}
                  onCheckedChange={() => onToggle(value)}
                  className="mt-0.5"
                />
                <label
                  htmlFor={`${filterKey}-${item._id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 flex items-center justify-between"
                >
                  <span>{capitalizeFirstLetter(displayName)}</span>
                  {item.count !== undefined && (
                    <span className="text-xs text-muted-foreground ml-2">({item.count})</span>
                  )}
                </label>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function FeedFilterContent({ onClearAll }: { onClearAll: () => void }) {
  const [queryState, setQueryState] = useQueryStates({
    category: parseAsArrayOf(parseAsString),
    brand: parseAsArrayOf(parseAsString),
    animal: parseAsArrayOf(parseAsString),
    phase: parseAsArrayOf(parseAsString),
    sub_type: parseAsArrayOf(parseAsString),
    p: parseAsInteger.withDefault(1),
  })

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ["feed-categories"],
    queryFn: () => queryFeedCategories(),
    refetchOnWindowFocus: false,
  })

  const { data: filtersData, isLoading: filtersLoading } = useQuery({
    queryKey: ["feed-filter-aggregates", queryState.brand, queryState.animal, queryState.phase, queryState.sub_type],
    queryFn: () => queryFeedFilterAggregates({
      brand: queryState.brand ?? [],
      animal: queryState.animal ?? [],
      phase: queryState.phase ?? [],
      sub_type: queryState.sub_type ?? [],
    }),
    refetchOnWindowFocus: false,
  })

  const categoryItems: FilterItem[] = useMemo(() => {
    const categories = categoriesData?.data || []
    return categories.map((cat: any) => ({
      _id: cat.slug,
      name: cat.name,
    }))
  }, [categoriesData])

  const brandItems: FilterItem[] = useMemo(() => {
    return (filtersData?.data?.brands || []).map((b: any) => ({
      _id: b._id,
      name: b.name,
      count: b.count,
    }))
  }, [filtersData])

  const animalItems: FilterItem[] = useMemo(() => {
    return (filtersData?.data?.animals || []).map((a: any) => ({
      _id: a._id,
      name: a._id,
      count: a.count,
    }))
  }, [filtersData])

  const phaseItems: FilterItem[] = useMemo(() => {
    return (filtersData?.data?.phases || []).map((ph: any) => ({
      _id: ph._id,
      name: ph._id,
      count: ph.count,
    }))
  }, [filtersData])

  const subTypeItems: FilterItem[] = useMemo(() => {
    return (filtersData?.data?.sub_types || []).map((st: any) => ({
      _id: st._id,
      name: st._id,
      count: st.count,
    }))
  }, [filtersData])

  const handleToggle = (filterKey: string, value: string) => {
    if (filterKey === "phase") {
      const currentValues = queryState.phase || []
      const isSelected = currentValues.includes(value)
      setQueryState({
        phase: isSelected ? null : [value],
        p: 1,
      })
    } else {
      const currentValues = queryState[filterKey as keyof typeof queryState] as string[] || []
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value]

      setQueryState({
        [filterKey]: newValues.length > 0 ? newValues : null,
        p: 1,
      })
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const totalFilters = (queryState.category?.length || 0) + (queryState.brand?.length || 0) + (queryState.animal?.length || 0) + (queryState.phase?.length || 0) + (queryState.sub_type?.length || 0)

  const filterSections = [
    {
      name: "Feeding Stage",
      key: "phase",
      items: phaseItems,
      isLoading: filtersLoading,
      useIdAsValue: true,
    },
    {
      name: "Category",
      key: "category",
      items: categoryItems,
      isLoading: categoriesLoading,
      useIdAsValue: true,
    },
    {
      name: "Brand",
      key: "brand",
      items: brandItems,
      isLoading: filtersLoading,
    },
    {
      name: "Livestock Type",
      key: "animal",
      items: animalItems,
      isLoading: filtersLoading,
      useIdAsValue: true,
    },
    {
      name: "Product Type",
      key: "sub_type",
      items: subTypeItems,
      isLoading: filtersLoading,
      useIdAsValue: true,
    },
  ]

  return (
    <div className="flex flex-col h-full">
      {totalFilters > 0 && (
        <div className="flex items-center justify-between mb-4 pb-4 border-b">
          <span className="text-sm text-muted-foreground">
            {totalFilters} filter{totalFilters !== 1 ? 's' : ''} applied
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="h-8 px-2 lg:px-3"
          >
            Clear all
            <X className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      <Accordion type="multiple" className="w-full flex-1" defaultValue={filterSections.filter(s => { const v = queryState[s.key as keyof typeof queryState]; return Array.isArray(v) ? v.length > 0 : false }).map(s => s.name).concat(["Feeding Stage", "Livestock Type"]).filter((v, i, a) => a.indexOf(v) === i)}>
        {filterSections.map((section) => {
          const selectedFilters = queryState[section.key as keyof typeof queryState] as string[] || []

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
                  useIdAsValue={section.useIdAsValue}
                />
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

export function FeedFilterSidebar() {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [, setQueryState] = useQueryStates({
    category: parseAsArrayOf(parseAsString),
    brand: parseAsArrayOf(parseAsString),
    animal: parseAsArrayOf(parseAsString),
    phase: parseAsArrayOf(parseAsString),
    sub_type: parseAsArrayOf(parseAsString),
    p: parseAsInteger.withDefault(1),
  })

  const handleClearAll = () => {
    setQueryState({
      category: null,
      brand: null,
      animal: null,
      phase: null,
      sub_type: null,
      p: 1,
    })
  }

  if (isDesktop) {
    return (
      <div className="sticky top-20 mt-[20px] max-h-[calc(100vh-5rem)] overflow-y-auto overflow-x-hidden">
        <FeedFilterContent onClearAll={handleClearAll} />
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
          <SheetTitle>Filter Feed Products</SheetTitle>
        </SheetHeader>
        <FeedFilterContent onClearAll={handleClearAll} />
      </SheetContent>
    </Sheet>
  )
}
