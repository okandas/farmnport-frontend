"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { Checkbox } from "@/components/ui/checkbox"
import { useQueryStates, parseAsArrayOf, parseAsString } from "nuqs"
import { Filter, X, Search } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useQuery } from "@tanstack/react-query"
import { useState, useMemo } from "react"
import { queryClientFilterAggregates, queryPricesByProduce } from "@/lib/query"
import { centsToDollars } from "@/lib/utilities"
import { sendGTMEvent } from "@next/third-parties/google"
import { paymentTermsLabel } from "@/components/structures/repository/data"
import Link from "next/link"

interface FilterItem {
  _id: string
  name?: string
  count: number
}

interface ClientFilterAggregates {
  provinces: FilterItem[]
  produce: FilterItem[]
  categories: FilterItem[]
  payment_terms: FilterItem[]
  pricing: FilterItem[]
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
            const displayName = item.name || item._id || ""
            const value = (item._id || "").toLowerCase()
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
                  <span className="capitalize">{displayName}</span>
                  {item.count > 0 && (
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

function FilterContent({
  onClearAll,
  type,
  hideProduce,
  hideCategory,
  product
}: {
  onClearAll: () => void
  type: 'buyers' | 'farmers'
  hideProduce?: boolean
  hideCategory?: boolean
  product?: string
}) {
  const [queryState, setQueryState] = useQueryStates({
    province: parseAsArrayOf(parseAsString),
    produce: parseAsArrayOf(parseAsString),
    category: parseAsArrayOf(parseAsString),
    payment_terms: parseAsArrayOf(parseAsString),
    pricing: parseAsArrayOf(parseAsString),
    verified: parseAsArrayOf(parseAsString),
  })

  // Fetch aggregate data for clients
  const { data: aggregateData, isLoading: isLoadingAggregates } = useQuery({
    queryKey: ["client-filter-aggregates", type],
    queryFn: async () => {
      const response = await queryClientFilterAggregates(type)
      return response.data as ClientFilterAggregates
    },
  })

  const provinceItems = useMemo(() => {
    return aggregateData?.provinces || []
  }, [aggregateData])

  const produceItems = useMemo(() => {
    return aggregateData?.produce || []
  }, [aggregateData])

  const categoryItems = useMemo(() => {
    return aggregateData?.categories || []
  }, [aggregateData])

  const paymentTermsItems = useMemo(() => {
    return (aggregateData?.payment_terms || []).map((item) => ({
      ...item,
      name: paymentTermsLabel(item._id),
    }))
  }, [aggregateData])

  const pricingItems = useMemo(() => {
    return aggregateData?.pricing || []
  }, [aggregateData])

  // Fetch prices for the product if specified
  const { data: priceData, isLoading: isLoadingPrices } = useQuery({
    queryKey: ["prices-by-produce", product],
    queryFn: async () => {
      const response = await queryPricesByProduce(product!)
      return response.data
    },
    enabled: !!product,
  })

  const latestPrices = useMemo(() => {
    if (!priceData?.data) return []
    // Group by client, take latest per client, limit to 5
    const byClient = new Map<string, { client_name: string; delivered: number; collected: number }>()
    for (const rel of priceData.data) {
      if (byClient.has(rel.client_id)) continue
      const pd = rel.price_data
      if (!pd) continue

      // Find the first grade with pricing data (price_data is a struct like ChickenPrice/BeefPrice with nested grade fields)
      let delivered = 0
      let collected = 0
      if (pd.pricing) {
        // Direct pricing (simple structure)
        delivered = pd.pricing.delivered || 0
        collected = pd.pricing.collected || 0
      } else {
        // Nested grades - scan all fields for the first one with pricing
        for (const key of Object.keys(pd)) {
          const grade = pd[key]
          if (grade?.pricing?.delivered > 0 || grade?.pricing?.collected > 0) {
            delivered = grade.pricing.delivered || 0
            collected = grade.pricing.collected || 0
            break
          }
        }
      }

      if (delivered > 0 || collected > 0) {
        byClient.set(rel.client_id, { client_name: rel.client_name, delivered, collected })
      }
      if (byClient.size >= 5) break
    }
    return Array.from(byClient.values())
  }, [priceData])

  const verifiedItems: FilterItem[] = [
    { _id: "true", name: "Verified", count: 0 },
    { _id: "false", name: "Not Verified", count: 0 },
  ]

  const singleSelectKeys = ["pricing", "payment_terms", "verified"]

  const handleToggle = (filterKey: string, value: string) => {
    const currentValues = queryState[filterKey as keyof typeof queryState] || []
    const isAdding = !currentValues.includes(value)

    let newValues: string[]
    if (singleSelectKeys.includes(filterKey)) {
      newValues = isAdding ? [value] : []
    } else {
      newValues = isAdding
        ? [...currentValues, value]
        : currentValues.filter(v => v !== value)
    }

    // Send GTM event
    const filterTypeMap: Record<string, string> = {
      'province': 'Province',
      'produce': 'Produce',
      'category': 'Category',
      'payment_terms': 'PaymentTerms',
      'pricing': 'Pricing',
      'verified': 'Verified'
    }
    const filterType = filterTypeMap[filterKey] || filterKey
    const action = isAdding ? 'Add' : 'Remove'
    const clientType = type === 'buyers' ? 'Buyer' : 'Farmer'
    sendGTMEvent({ event: 'filter', value: `${action}${clientType}${filterType}Filter` })

    setQueryState({
      [filterKey]: newValues.length > 0 ? newValues : null
    })
  }

  const totalFilters = Object.values(queryState).reduce((acc, val) => acc + (val?.length || 0), 0)

  const filterSections = [
    ...(type === 'buyers' ? [{
      name: "Verified",
      key: "verified",
      items: verifiedItems,
      isLoading: false
    }] : []),
    {
      name: "Payment Terms",
      key: "payment_terms",
      items: paymentTermsItems,
      isLoading: isLoadingAggregates
    },
    {
      name: "Pricing",
      key: "pricing",
      items: pricingItems,
      isLoading: isLoadingAggregates
    },
    ...(!hideProduce ? [{
      name: "Produce",
      key: "produce",
      items: produceItems,
      isLoading: isLoadingAggregates
    }] : []),
    ...(!hideCategory ? [{
      name: "Category",
      key: "category",
      items: categoryItems,
      isLoading: isLoadingAggregates
    }] : []),
    {
      name: "Province",
      key: "province",
      items: provinceItems,
      isLoading: isLoadingAggregates
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

      <Accordion type="multiple" className="w-full flex-1" defaultValue={["Payment Terms"]}>
        {filterSections.map((section) => {
          const selectedFilters = queryState[section.key as keyof typeof queryState] || []

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

      {product && latestPrices.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <h4 className="text-sm font-semibold mb-3 capitalize">{product} Prices</h4>
          <div className="space-y-2">
            {latestPrices.map((price) => (
              <div key={price.client_name} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground truncate mr-2">{price.client_name}</span>
                <span className="font-medium whitespace-nowrap">
                  {price.delivered > 0 ? centsToDollars(price.delivered) : centsToDollars(price.collected)}
                </span>
              </div>
            ))}
          </div>
          <Link
            href={`/prices?produce=${product}`}
            className="text-xs text-primary hover:underline mt-2 block"
          >
            View all prices
          </Link>
        </div>
      )}
      {product && isLoadingPrices && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">Loading prices...</p>
        </div>
      )}
    </div>
  )
}

export function ClientFilterSidebar({ type, hideProduce, hideCategory, product }: { type: 'buyers' | 'farmers', hideProduce?: boolean, hideCategory?: boolean, product?: string }) {
  const isDesktop = useMediaQuery("(min-width: 1024px)")
  const [, setQueryState] = useQueryStates({
    province: parseAsArrayOf(parseAsString),
    produce: parseAsArrayOf(parseAsString),
    category: parseAsArrayOf(parseAsString),
    payment_terms: parseAsArrayOf(parseAsString),
    pricing: parseAsArrayOf(parseAsString),
    verified: parseAsArrayOf(parseAsString),
  })

  const handleClearAll = () => {
    setQueryState({
      province: null,
      produce: null,
      category: null,
      payment_terms: null,
      pricing: null,
      verified: null,
    })
  }

  // Desktop: Sticky sidebar
  if (isDesktop) {
    return (
      <div className="sticky top-20 mt-[20px]">
        <FilterContent onClearAll={handleClearAll} type={type} hideProduce={hideProduce} hideCategory={hideCategory} product={product} />
      </div>
    )
  }

  // Mobile: Sheet with trigger button
  const clientLabel = type === 'buyers' ? 'Buyers' : 'Farmers'
  const filterTitle = product
    ? `Filter ${product.charAt(0).toUpperCase() + product.slice(1)} ${clientLabel}`
    : `Filter ${clientLabel}`

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="w-full mb-4">
          <Filter className="mr-2 h-4 w-4" />
          {filterTitle}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{filterTitle}</SheetTitle>
        </SheetHeader>
        <FilterContent onClearAll={handleClearAll} type={type} hideProduce={hideProduce} hideCategory={hideCategory} product={product} />
      </SheetContent>
    </Sheet>
  )
}
