"use client"

import { useFormContext } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export function ProductPricingSection() {
    const { control } = useFormContext()
    return (
        <div className="border-b border-gray-900/10 dark:border-gray-100/10 pb-12">
            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Pricing & Stock</h2>
            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Guide pricing and inventory information.</p>

            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                <div className="sm:col-span-3 flex items-center gap-4">
                    <FormField
                        control={control}
                        name="show_price"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <label className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer" onClick={() => field.onChange(!field.value)}>
                                    Show Price on Guides
                                </label>
                            </FormItem>
                        )}
                    />
                </div>
                <div className="sm:col-span-3 flex items-center gap-4">
                    <FormField
                        control={control}
                        name="available_for_sale"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <label className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer" onClick={() => field.onChange(!field.value)}>
                                    Available for Sale
                                </label>
                            </FormItem>
                        )}
                    />
                </div>
                <div className="sm:col-span-2">
                    <FormField
                        control={control}
                        name="sale_price"
                        render={({ field }) => (
                            <FormItem>
                                <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Sale Price (USD)</label>
                                <FormControl>
                                    <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="sm:col-span-2">
                    <FormField
                        control={control}
                        name="was_price"
                        render={({ field }) => (
                            <FormItem>
                                <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Was Price (USD)</label>
                                <FormControl>
                                    <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="sm:col-span-2">
                    <FormField
                        control={control}
                        name="weight_grams"
                        render={({ field }) => (
                            <FormItem>
                                <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Weight (grams)</label>
                                <FormControl>
                                    <Input type="number" min="0" placeholder="0" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="sm:col-span-2">
                    <FormField
                        control={control}
                        name="stock_level"
                        render={({ field }) => (
                            <FormItem>
                                <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Stock Level</label>
                                <FormControl>
                                    <Input type="number" min="0" placeholder="0" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
        </div>
    )
}
