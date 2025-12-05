import { useState } from "react"
import { UseFormSetValue } from "react-hook-form"
import { ProducerPriceList } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Icons } from "@/components/icons/lucide"
import { Badge } from "@/components/ui/badge"

type BulkPriceHelperProps = {
  category: "beef" | "lamb" | "mutton" | "goat" | "chicken" | "pork"
  setValue: UseFormSetValue<ProducerPriceList>
  priceType: "delivered" | "collected"
}

/**
 * Bulk price entry helper
 * Allows users to apply the same price to all grades in a category
 */
export function BulkPriceHelper({
  category,
  setValue,
  priceType,
}: BulkPriceHelperProps) {
  const [bulkPrice, setBulkPrice] = useState("")
  const [open, setOpen] = useState(false)

  const handleApplyBulkPrice = () => {
    const price = parseFloat(bulkPrice)
    if (isNaN(price) || price < 0) return

    // Define all the grade paths for each category
    const categoryGrades: Record<string, string[]> = {
      beef: ["super", "choice", "commercial", "economy", "manufacturing", "condemned"],
      lamb: ["super_premium", "choice", "standard", "inferior"],
      mutton: ["super", "choice", "standard", "ordinary", "inferior"],
      goat: ["super", "choice", "standard", "inferior"],
      chicken: [
        "a_grade_over_1_75",
        "a_grade_1_55_1_75",
        "a_grade_under_1_55",
        "off_layers",
        "condemned",
      ],
      pork: ["super", "manufacturing", "head"],
    }

    const grades = categoryGrades[category] || []

    // Apply the price to all grades in the category
    grades.forEach((grade) => {
      const path =
        `${category}.${grade}.pricing.${priceType}` as keyof ProducerPriceList
      setValue(path as any, price)
    })

    setBulkPrice("")
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 ml-auto"
        >
          <Icons.sparkles className="size-4" />
          Quick Fill
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icons.zap className="size-4 text-amber-500" />
              <h4 className="font-medium text-sm">Apply Same Price to All</h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a price to apply it to all {category} {priceType} grades at
              once
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bulk-price">Price Amount</Label>
            <Input
              id="bulk-price"
              type="number"
              min="0"
              step="any"
              placeholder="0.00"
              value={bulkPrice}
              onChange={(e) => setBulkPrice(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleApplyBulkPrice()
                }
              }}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleApplyBulkPrice}
              disabled={!bulkPrice || parseFloat(bulkPrice) < 0}
              size="sm"
              className="flex-1"
            >
              Apply to All
            </Button>
            <Button
              type="button"
              onClick={() => {
                setBulkPrice("")
                setOpen(false)
              }}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>

          <Badge variant="secondary" className="w-full justify-center text-xs">
            <Icons.info className="size-3 mr-1" />
            You can still adjust individual prices after
          </Badge>
        </div>
      </PopoverContent>
    </Popover>
  )
}
