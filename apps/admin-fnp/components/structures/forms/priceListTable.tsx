import { UseFormReturn } from "react-hook-form"
import { ProducerPriceList } from "@/lib/schemas"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utilities"
import { Icons } from "@/components/icons/lucide"

type PriceListTableProps = {
  form: UseFormReturn<ProducerPriceList>
  selectedFarmProduce: string[]
}

type CategoryConfig = {
  key: keyof ProducerPriceList
  name: string
  icon: keyof typeof Icons
  grades: { key: string; label: string }[]
}

const categoryConfigs: CategoryConfig[] = [
  {
    key: "beef",
    name: "Beef",
    icon: "beef",
    grades: [
      { key: "super", label: "Super" },
      { key: "choice", label: "Choice" },
      { key: "commercial", label: "Commercial" },
      { key: "economy", label: "Economy" },
      { key: "manufacturing", label: "Manufacturing" },
      { key: "condemned", label: "Condemned" },
    ],
  },
  {
    key: "lamb",
    name: "Lamb",
    icon: "beef",
    grades: [
      { key: "super_premium", label: "Super Premium" },
      { key: "choice", label: "Choice" },
      { key: "standard", label: "Standard" },
      { key: "inferior", label: "Inferior" },
    ],
  },
  {
    key: "mutton",
    name: "Mutton",
    icon: "beef",
    grades: [
      { key: "super", label: "Super" },
      { key: "choice", label: "Choice" },
      { key: "standard", label: "Standard" },
      { key: "ordinary", label: "Ordinary" },
      { key: "inferior", label: "Inferior" },
    ],
  },
  {
    key: "goat",
    name: "Goat",
    icon: "beef",
    grades: [
      { key: "super", label: "Super" },
      { key: "choice", label: "Choice" },
      { key: "standard", label: "Standard" },
      { key: "inferior", label: "Inferior" },
    ],
  },
  {
    key: "chicken",
    name: "Chicken",
    icon: "bird",
    grades: [
      { key: "a_grade_over_1_75", label: "A Grade Over 1.75" },
      { key: "a_grade_1_55_1_75", label: "A Grade 1.55-1.75" },
      { key: "a_grade_under_1_55", label: "A Grade Under 1.55" },
      { key: "off_layers", label: "Off Layers" },
      { key: "condemned", label: "Condemned" },
    ],
  },
  {
    key: "pork",
    name: "Pork",
    icon: "piggyBank",
    grades: [
      { key: "super", label: "Super" },
      { key: "manufacturing", label: "Manufacturing" },
      { key: "head", label: "Head" },
    ],
  },
  {
    key: "catering",
    name: "Catering",
    icon: "utensilsCrossed",
    grades: [
      { key: "orders", label: "Catering Orders" },
    ],
  },
]

/**
 * Excel-like table view for producer price lists
 * Displays pricing data in a structured table format matching the Excel template
 */
export function PriceListTable({
  form,
  selectedFarmProduce,
}: PriceListTableProps) {
  const { register, watch } = form

  // Get enabled categories based on hasPrice flag
  const enabledCategories = categoryConfigs.filter((config) => {
    const categoryData = watch(config.key) as any
    return categoryData?.hasPrice === true
  })

  if (enabledCategories.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 border rounded-lg">
        <Icons.fileSpreadsheet className="mx-auto mb-2 size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No categories selected. Enable pricing categories to see the table.
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b">
            <th className="px-4 py-3 text-left font-semibold border-r">
              Category
            </th>
            <th className="px-4 py-3 text-left font-semibold border-r">
              Grade
            </th>
            <th className="px-4 py-3 text-center font-semibold border-r bg-blue-50">
              Collected ZIG
            </th>
            <th className="px-4 py-3 text-center font-semibold border-r bg-blue-50">
              Delivered ZIG
            </th>
            <th className="px-4 py-3 text-center font-semibold border-r bg-green-50">
              Collected USD
            </th>
            <th className="px-4 py-3 text-center font-semibold bg-green-50">
              Delivered USD
            </th>
          </tr>
        </thead>
        <tbody>
          {enabledCategories.map((category) => {
            const categoryData = watch(category.key) as any
            const hasCollectedPrice = categoryData?.hasCollectedPrice === true
            const Icon = Icons[category.icon]

            return category.grades.map((grade, gradeIndex) => {
              const isFirstRow = gradeIndex === 0
              const gradeData = categoryData?.[grade.key]

              // Special handling for catering
              const isCatering = category.key === "catering"
              const deliveredZigPath = isCatering
                ? `${category.key}.${grade.key}.order.price`
                : `${category.key}.${grade.key}.pricing.delivered`
              const collectedZigPath = `${category.key}.${grade.key}.pricing.collected`

              return (
                <tr
                  key={`${category.key}-${grade.key}`}
                  className={cn(
                    "border-b hover:bg-gray-50",
                    isFirstRow && "border-t-2"
                  )}
                >
                  {isFirstRow && (
                    <td
                      className="px-4 py-3 font-medium border-r bg-gray-50"
                      rowSpan={category.grades.length}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="size-4 text-muted-foreground" />
                        <span>{category.name}</span>
                      </div>
                    </td>
                  )}
                  <td className="px-4 py-2 border-r">{grade.label}</td>

                  {/* Collected ZIG */}
                  <td className="px-2 py-2 border-r bg-blue-50/30">
                    {hasCollectedPrice && !isCatering ? (
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="h-8 text-center"
                        {...register(collectedZigPath as any, {
                          valueAsNumber: true,
                        })}
                      />
                    ) : (
                      <div className="h-8 flex items-center justify-center text-muted-foreground text-xs">
                        -
                      </div>
                    )}
                  </td>

                  {/* Delivered ZIG */}
                  <td className="px-2 py-2 border-r bg-blue-50/30">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="h-8 text-center"
                      {...register(deliveredZigPath as any, {
                        valueAsNumber: true,
                      })}
                    />
                  </td>

                  {/* Collected USD - Currently showing converted cents */}
                  <td className="px-2 py-2 border-r bg-green-50/30">
                    {hasCollectedPrice && !isCatering ? (
                      <div className="h-8 flex items-center justify-center text-xs text-muted-foreground">
                        {gradeData?.pricing?.collected_usd
                          ? `$${(gradeData.pricing.collected_usd / 100).toFixed(2)}`
                          : "-"}
                      </div>
                    ) : (
                      <div className="h-8 flex items-center justify-center text-muted-foreground text-xs">
                        -
                      </div>
                    )}
                  </td>

                  {/* Delivered USD - Currently showing converted cents */}
                  <td className="px-2 py-2 bg-green-50/30">
                    <div className="h-8 flex items-center justify-center text-xs text-muted-foreground">
                      {gradeData?.pricing?.delivered_usd || gradeData?.order?.price_usd
                        ? `$${((gradeData?.pricing?.delivered_usd || gradeData?.order?.price_usd || 0) / 100).toFixed(2)}`
                        : "-"}
                    </div>
                  </td>
                </tr>
              )
            })
          })}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-3 text-xs bg-gray-50 border-t">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border rounded bg-blue-50"></div>
          <span className="text-muted-foreground">ZIG Currency</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border rounded bg-green-50"></div>
          <span className="text-muted-foreground">USD Currency (Auto-converted)</span>
        </div>
        <div className="ml-auto text-muted-foreground">
          {enabledCategories.length} {enabledCategories.length === 1 ? "category" : "categories"} enabled
        </div>
      </div>
    </div>
  )
}
