"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { cn } from "@/lib/utilities"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  queryAgroChemicals,
  queryAnimalHealthProducts,
  queryFeedProducts,
} from "@/lib/query"

export type ProductType = "animal_health" | "feed" | "agrochemical"

export interface ProductSelection {
  id: string
  name: string
  slug: string
  type: ProductType
}

interface ProductComboboxProps {
  productType: ProductType
  value: string // selected product id
  onChange: (selection: ProductSelection) => void
}

function useProductSearch(productType: ProductType, search: string, enabled: boolean) {
  const queryFn = () => {
    const params = { search }
    if (productType === "animal_health") return queryAnimalHealthProducts(params)
    if (productType === "feed") return queryFeedProducts(params)
    return queryAgroChemicals(params)
  }

  return useQuery({
    queryKey: ["product-search", productType, search],
    queryFn,
    enabled,
    select: (res) => {
      const raw = res?.data
      // different endpoints nest results differently — normalise here
      if (Array.isArray(raw?.products)) return raw.products
      if (Array.isArray(raw?.data)) return raw.data
      if (Array.isArray(raw)) return raw
      return []
    },
  })
}

const PLACEHOLDER: Record<ProductType, string> = {
  animal_health: "Search animal health products...",
  feed: "Search feed products...",
  agrochemical: "Search agrochemicals...",
}

export function ProductCombobox({ productType, value, onChange }: ProductComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const { data: products = [], isLoading } = useProductSearch(productType, search, open)

  const selected = products.find((p: any) => p.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selected ? selected.name : "Select product..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder={PLACEHOLDER[productType]}
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>
            {isLoading ? "Searching..." : "No products found."}
          </CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {products.map((product: any) => (
              <CommandItem
                key={product.id}
                value={product.id}
                onSelect={(currentValue) => {
                  onChange({
                    id: currentValue === value ? "" : product.id,
                    name: product.name,
                    slug: product.slug,
                    type: productType,
                  })
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === product.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {product.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
