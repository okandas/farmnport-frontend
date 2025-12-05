import { Control, FieldPath } from "react-hook-form"
import { ProducerPriceList } from "@/lib/schemas"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

// Type for a single price input field configuration
type PriceField = {
  name: FieldPath<ProducerPriceList>
  label: string
  placeholder: string
}

// Props for PriceInputGrid component
type PriceInputGridProps = {
  control: Control<ProducerPriceList>
  fields: PriceField[]
  columns?: 4 | 5 | 6
  title?: string
}

/**
 * Reusable grid of price input fields
 * Reduces duplication by rendering multiple price inputs in a responsive grid
 */
export function PriceInputGrid({
  control,
  fields,
  columns = 6,
  title,
}: PriceInputGridProps) {
  const gridCols = {
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
    6: "lg:grid-cols-6",
  }

  return (
    <>
      {title && <h3 className="mt-3">{title}</h3>}
      <div
        className={`grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 ${gridCols[columns]}`}
      >
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={field.placeholder}
                    {...formField}
                    type="number"
                    min="0"
                    step="any"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </div>
    </>
  )
}

// Props for CategorySection component
type CategorySectionProps = {
  title: string
  show: boolean
  deliveredFields: PriceField[]
  collectedFields?: PriceField[]
  showCollected?: boolean
  control: Control<ProducerPriceList>
  gridColumns?: 4 | 5 | 6
}

/**
 * Reusable category pricing section with card wrapper
 * Handles both delivered and collected pricing with conditional rendering
 */
export function CategorySection({
  title,
  show,
  deliveredFields,
  collectedFields,
  showCollected = false,
  control,
  gridColumns = 6,
}: CategorySectionProps) {
  if (!show) return null

  return (
    <Card className="mt-3">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <PriceInputGrid
          control={control}
          fields={deliveredFields}
          columns={gridColumns}
          title={`${title.split(" ")[0]} Prices Delivered`}
        />

        {showCollected && collectedFields && (
          <PriceInputGrid
            control={control}
            fields={collectedFields}
            columns={gridColumns}
            title={`${title.split(" ")[0]} Prices Collected`}
          />
        )}
      </CardContent>
    </Card>
  )
}

// Props for CategoryCheckbox component
type CategoryCheckboxProps = {
  control: Control<ProducerPriceList>
  name: FieldPath<ProducerPriceList>
  label: string
  collectionName?: FieldPath<ProducerPriceList>
  hasCollectionOption?: boolean
}

/**
 * Reusable category selection checkbox
 * Optionally includes collection price toggle
 */
export function CategoryCheckbox({
  control,
  name,
  label,
  collectionName,
  hasCollectionOption = false,
}: CategoryCheckboxProps) {
  if (!hasCollectionOption) {
    return (
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem className="flex flex-row items-start p-4 space-x-3 space-y-0 border rounded-md">
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Checkbox
                checked={field.value as boolean}
                onCheckedChange={() => field.onChange(!field.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    )
  }

  return (
    <div className="border rounded-md">
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem className="flex flex-row items-start p-4 space-x-3 space-y-0">
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Checkbox
                checked={field.value as boolean}
                onCheckedChange={() => field.onChange(!field.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {collectionName && (
        <FormField
          control={control}
          name={collectionName}
          render={({ field }) => (
            <FormItem className="flex flex-row items-start p-4 space-x-3 space-y-0">
              <FormLabel>Add Collection Price</FormLabel>
              <FormControl>
                <Checkbox
                  checked={field.value as boolean}
                  onCheckedChange={() => field.onChange(!field.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  )
}

// Field configuration generators for each animal category
export const getBeefFields = (type: "delivered" | "collected"): PriceField[] => {
  const prefix = `beef`
  return [
    {
      name: `${prefix}.super.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Super",
      placeholder: "Price Super Beef",
    },
    {
      name: `${prefix}.choice.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Choice",
      placeholder: "Price Choice Beef",
    },
    {
      name: `${prefix}.commercial.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Commercial",
      placeholder: "Price Commercial Beef",
    },
    {
      name: `${prefix}.economy.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Economy",
      placeholder: "Price Economy Beef",
    },
    {
      name: `${prefix}.manufacturing.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Manufacturing",
      placeholder: "Price Manufacturing Beef",
    },
    {
      name: `${prefix}.condemned.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Condemned",
      placeholder: "Price Condemned Beef",
    },
  ]
}

export const getLambFields = (type: "delivered" | "collected"): PriceField[] => {
  const prefix = `lamb`
  return [
    {
      name: `${prefix}.super_premium.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Super/Super Premium",
      placeholder: "Price Super/Super Premium Lamb",
    },
    {
      name: `${prefix}.choice.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Choice",
      placeholder: "Price Choice Lamb",
    },
    {
      name: `${prefix}.standard.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Standard",
      placeholder: "Price Standard Lamb",
    },
    {
      name: `${prefix}.inferior.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Inferior",
      placeholder: "Price Inferior Lamb",
    },
  ]
}

export const getMuttonFields = (
  type: "delivered" | "collected",
): PriceField[] => {
  const prefix = `mutton`
  return [
    {
      name: `${prefix}.super.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Super",
      placeholder: "Price Super",
    },
    {
      name: `${prefix}.choice.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Choice",
      placeholder: "Price Choice",
    },
    {
      name: `${prefix}.standard.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Standard",
      placeholder: "Price Standard",
    },
    {
      name: `${prefix}.ordinary.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Ordinary",
      placeholder: "Price Ordinary",
    },
    {
      name: `${prefix}.inferior.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Inferior",
      placeholder: "Price Inferior",
    },
  ]
}

export const getGoatFields = (type: "delivered" | "collected"): PriceField[] => {
  const prefix = `goat`
  return [
    {
      name: `${prefix}.super.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Super",
      placeholder: "Price Super",
    },
    {
      name: `${prefix}.choice.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Choice",
      placeholder: "Price Choice",
    },
    {
      name: `${prefix}.standard.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Standard",
      placeholder: "Price Standard",
    },
    {
      name: `${prefix}.inferior.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Inferior",
      placeholder: "Price Inferior",
    },
  ]
}

export const getChickenFields = (
  type: "delivered" | "collected",
): PriceField[] => {
  const prefix = `chicken`
  return [
    {
      name: `${prefix}.a_grade_under_1_55.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Below 1.55 Kgs",
      placeholder: "Price Below 1.55kgs",
    },
    {
      name: `${prefix}.a_grade_1_55_1_75.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "1.55 to 1.75 Kgs",
      placeholder: "Price Between 1.55 and 1.75 Kgs",
    },
    {
      name: `${prefix}.a_grade_over_1_75.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Over 1.75 Kgs",
      placeholder: "Price For Over 1.75Kgs",
    },
    {
      name: `${prefix}.off_layers.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Off Layers",
      placeholder: "Price OffLayers Chicken",
    },
    {
      name: `${prefix}.condemned.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Condemned",
      placeholder: "Price Condemned Chicken",
    },
  ]
}

export const getPorkFields = (type: "delivered" | "collected"): PriceField[] => {
  const prefix = `pork`
  return [
    {
      name: `${prefix}.super.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Super",
      placeholder: "Price Super",
    },
    {
      name: `${prefix}.manufacturing.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Manufacturing",
      placeholder: "Price Manufacturing",
    },
    {
      name: `${prefix}.head.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Pork Head",
      placeholder: "Price Pork Head",
    },
  ]
}

export const getSlaughterFields = (type: "delivered" | "collected"): PriceField[] => {
  const prefix = `slaughter`
  return [
    {
      name: `${prefix}.cattle.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Cattle",
      placeholder: "Price Cattle Slaughter",
    },
    {
      name: `${prefix}.sheep.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Sheep",
      placeholder: "Price Sheep Slaughter",
    },
    {
      name: `${prefix}.pigs.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Pigs",
      placeholder: "Price Pigs Slaughter",
    },
    {
      name: `${prefix}.chicken.pricing.${type}` as FieldPath<ProducerPriceList>,
      label: "Chicken per kg LWT",
      placeholder: "Price Chicken Slaughter per kg",
    },
  ]
}
