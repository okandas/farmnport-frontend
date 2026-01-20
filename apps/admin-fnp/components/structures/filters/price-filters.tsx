"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, X, Filter } from "lucide-react"
import { cn } from "@/lib/utilities"

interface PriceFiltersProps {
  onFilterChange: (filters: PriceFilterState) => void
  availableClients?: string[]
}

export interface PriceFilterState {
  clientSearch: string
  selectedProduce: string[]
  dateRange?: {
    start: Date | null
    end: Date | null
  }
}

const PRODUCE_TYPES = [
  { value: "beef", label: "Beef" },
  { value: "lamb", label: "Lamb" },
  { value: "mutton", label: "Mutton" },
  { value: "goat", label: "Goat" },
  { value: "chicken", label: "Chicken" },
  { value: "pork", label: "Pork" },
  { value: "slaughter", label: "Slaughter Services" },
]

export function PriceFilters({ onFilterChange, availableClients = [] }: PriceFiltersProps) {
  const [clientSearch, setClientSearch] = useState("")
  const [selectedProduce, setSelectedProduce] = useState<string[]>([])

  const handleProduceToggle = (produceValue: string) => {
    const newSelected = selectedProduce.includes(produceValue)
      ? selectedProduce.filter((p) => p !== produceValue)
      : [...selectedProduce, produceValue]

    setSelectedProduce(newSelected)
    onFilterChange({
      clientSearch,
      selectedProduce: newSelected,
    })
  }

  const handleClientSearchChange = (value: string) => {
    setClientSearch(value)
    onFilterChange({
      clientSearch: value,
      selectedProduce,
    })
  }

  const handleReset = () => {
    setClientSearch("")
    setSelectedProduce([])
    onFilterChange({
      clientSearch: "",
      selectedProduce: [],
    })
  }

  const activeFilterCount = selectedProduce.length + (clientSearch ? 1 : 0)

  return (
    <div className="w-full lg:w-64 flex-shrink-0">
      <div className="sticky top-6 space-y-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-700" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </div>

        {/* Client Search */}
        <div className="space-y-2">
          <Label htmlFor="client-search" className="text-sm font-medium text-gray-700">
            Search Buyer/Client
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="client-search"
              type="text"
              placeholder="Client name..."
              value={clientSearch}
              onChange={(e) => handleClientSearchChange(e.target.value)}
              className="pl-9 pr-8"
            />
            {clientSearch && (
              <button
                onClick={() => handleClientSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100"
              >
                <X className="h-3 w-3 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Produce Type Filter */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Produce Type</Label>
          <div className="space-y-2">
            {PRODUCE_TYPES.map((produce) => (
              <button
                key={produce.value}
                onClick={() => handleProduceToggle(produce.value)}
                className={cn(
                  "w-full flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  selectedProduce.includes(produce.value)
                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <span>{produce.label}</span>
                {selectedProduce.includes(produce.value) && (
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Reset Button */}
        {activeFilterCount > 0 && (
          <Button
            variant="outline"
            onClick={handleReset}
            className="w-full text-sm"
            size="sm"
          >
            <X className="mr-2 h-4 w-4" />
            Clear All Filters
          </Button>
        )}

        {/* Active Filters Summary */}
        {selectedProduce.length > 0 && (
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <Label className="text-xs font-medium text-gray-600 uppercase tracking-wide">
              Active Filters
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {selectedProduce.map((produce) => {
                const produceLabel = PRODUCE_TYPES.find((p) => p.value === produce)?.label
                return (
                  <Badge
                    key={produce}
                    variant="secondary"
                    className="text-xs cursor-pointer hover:bg-gray-200"
                    onClick={() => handleProduceToggle(produce)}
                  >
                    {produceLabel}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
