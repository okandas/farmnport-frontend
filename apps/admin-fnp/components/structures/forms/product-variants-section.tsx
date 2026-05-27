"use client"

import { Control, FieldArrayWithId, UseFieldArrayAppend, UseFieldArrayRemove } from "react-hook-form"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"

interface ProductVariantsSectionProps {
    control: Control<any>
    variantFields: FieldArrayWithId<any, any, "id">[]
    appendVariant: UseFieldArrayAppend<any, any>
    removeVariant: UseFieldArrayRemove
    watchedVariants: any[]
}

export function ProductVariantsSection({
    control,
    variantFields,
    appendVariant,
    removeVariant,
    watchedVariants,
}: ProductVariantsSectionProps) {
    return (
        <div className="border-b border-gray-900/10 dark:border-gray-100/10 pb-12">
            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Pack Sizes / Variants</h2>
            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
                Add different pack sizes with their own SKU, stock level, and pricing.
            </p>

            <div className="mt-6 divide-y divide-gray-200 dark:divide-white/10">
                {variantFields.map((field, index) => {
                    const salePrice = Number(watchedVariants?.[index]?.sale_price) || 0
                    const wholesalePrice = Number(watchedVariants?.[index]?.wholesale_price) || 0
                    const margin = salePrice > 0 && wholesalePrice > 0
                        ? ((salePrice - wholesalePrice) / salePrice * 100).toFixed(1)
                        : null
                    return (
                        <div key={field.id} className="py-4 first:pt-0">
                            <div className="flex items-start gap-3">
                                <div className="flex-1 grid grid-cols-1 gap-3 sm:grid-cols-6">
                                    <FormField
                                        control={control}
                                        name={`variants.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Name</label>
                                                <FormControl>
                                                    <Input placeholder="e.g. 100ml, 500ml, 5L" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name={`variants.${index}.sku`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">SKU</label>
                                                <FormControl>
                                                    <Input placeholder="e.g. TRTX-100" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name={`variants.${index}.wholesale_price`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Wholesale ($)</label>
                                                <FormControl>
                                                    <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name={`variants.${index}.sale_price`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Sale Price ($)</label>
                                                <FormControl>
                                                    <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name={`variants.${index}.was_price`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Was Price ($)</label>
                                                <FormControl>
                                                    <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name={`variants.${index}.weight_grams`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Weight (g)</label>
                                                <FormControl>
                                                    <Input type="number" min="0" placeholder="0" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={control}
                                        name={`variants.${index}.stock_level`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Stock</label>
                                                <FormControl>
                                                    <Input type="number" min="0" placeholder="0" {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex flex-col items-center gap-1 mt-5">
                                    {margin !== null ? (
                                        <span className={`text-xs font-semibold px-2 py-1 rounded ${Number(margin) >= 20 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : Number(margin) >= 10 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                            {margin}%
                                        </span>
                                    ) : (
                                        <span className="text-xs text-gray-400">—%</span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(index)}
                                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                    >
                                        <Icons.close className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => appendVariant({ sku: "", name: "", stock_level: 0, sale_price: 0, was_price: 0, weight_grams: 0, wholesale_price: 0 })}
            >
                <Icons.add className="w-4 h-4 mr-1" />
                Add Variant
            </Button>
        </div>
    )
}
