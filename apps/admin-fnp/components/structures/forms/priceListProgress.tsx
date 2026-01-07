import { ProducerPriceList } from "@/lib/schemas"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/components/icons/lucide"
import { cn } from "@/lib/utilities"

type PriceListProgressProps = {
  values: ProducerPriceList
}

type CategoryStatus = {
  name: string
  enabled: boolean
  filled: boolean
}

/**
 * Progress indicator for price list form
 * Shows which categories are enabled and which have been filled with prices
 */
export function PriceListProgress({ values }: PriceListProgressProps) {
  // Check if a category has any non-zero prices
  const hasPrices = (category: any, hasCollected: boolean) => {
    if (!category || typeof category !== "object") return false

    let hasAnyPrice = false

    Object.keys(category).forEach((key) => {
      if (key === "hasPrice" || key === "hasCollectedPrice" || key === "detained") return

      const item = category[key]
      if (item?.pricing) {
        if (item.pricing.delivered > 0) hasAnyPrice = true
        if (hasCollected && item.pricing.collected > 0) hasAnyPrice = true
      }
      // Special case for catering
      if (item?.order?.price > 0) hasAnyPrice = true
    })

    return hasAnyPrice
  }

  const categories: CategoryStatus[] = [
    {
      name: "Beef",
      enabled: values.beef.hasPrice,
      filled: hasPrices(values.beef, values.beef.hasCollectedPrice),
    },
    {
      name: "Lamb",
      enabled: values.lamb.hasPrice,
      filled: hasPrices(values.lamb, values.lamb.hasCollectedPrice),
    },
    {
      name: "Mutton",
      enabled: values.mutton.hasPrice,
      filled: hasPrices(values.mutton, values.mutton.hasCollectedPrice),
    },
    {
      name: "Goat",
      enabled: values.goat.hasPrice,
      filled: hasPrices(values.goat, values.goat.hasCollectedPrice),
    },
    {
      name: "Chicken",
      enabled: values.chicken.hasPrice,
      filled: hasPrices(values.chicken, values.chicken.hasCollectedPrice),
    },
    {
      name: "Pork",
      enabled: values.pork.hasPrice,
      filled: hasPrices(values.pork, values.pork.hasCollectedPrice),
    },
    {
      name: "Slaughter",
      enabled: values.slaughter.hasPrice,
      filled: hasPrices(values.slaughter, values.slaughter.hasCollectedPrice),
    },
    {
      name: "Catering",
      enabled: values.catering.hasPrice,
      filled: hasPrices(values.catering, false),
    },
  ]

  const enabledCount = categories.filter((c) => c.enabled).length
  const filledCount = categories.filter((c) => c.enabled && c.filled).length
  const progress =
    enabledCount > 0 ? Math.round((filledCount / enabledCount) * 100) : 0

  // Don't show if no categories are selected
  if (enabledCount === 0) return null

  return (
    <div className="p-4 mb-6 bg-white border rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Form Progress</h3>
        <Badge
          variant={progress === 100 ? "default" : "secondary"}
          className={cn(
            progress === 100 && "bg-green-600 hover:bg-green-700",
          )}
        >
          {progress}% Complete
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 mb-4 bg-gray-200 rounded-full">
        <div
          className="h-2 transition-all duration-300 bg-blue-600 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Category status indicators */}
      <div className="flex flex-wrap gap-2">
        {categories
          .filter((c) => c.enabled)
          .map((category) => (
            <div
              key={category.name}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 text-xs rounded-md border transition-colors",
                category.filled
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-amber-50 border-amber-200 text-amber-700",
              )}
            >
              {category.filled ? (
                <Icons.checkCircle2 className="size-3" />
              ) : (
                <Icons.circle className="size-3" />
              )}
              <span className="font-medium">{category.name}</span>
            </div>
          ))}
      </div>

      {filledCount < enabledCount && (
        <p className="mt-3 text-xs text-muted-foreground">
          Complete {enabledCount - filledCount} more{" "}
          {enabledCount - filledCount === 1 ? "category" : "categories"} to
          finish
        </p>
      )}
    </div>
  )
}
