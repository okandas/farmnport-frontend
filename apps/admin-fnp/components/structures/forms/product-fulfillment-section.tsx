"use client"

import { useFormContext } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import { FormControl, FormField, FormItem } from "@/components/ui/form"
import { LocationMultiSelect, SelectedLocation } from "@/components/ui/location-multi-select"

interface ProductFulfillmentSectionProps {
    allLocations: { id: string; name: string; active: boolean }[]
    pickupLocations: SelectedLocation[]
    setPickupLocations: (locs: SelectedLocation[]) => void
    deliveryLocations: SelectedLocation[]
    setDeliveryLocations: (locs: SelectedLocation[]) => void
    pickupQueryKey: string
    deliveryQueryKey: string
}

export function ProductFulfillmentSection({
    allLocations,
    pickupLocations,
    setPickupLocations,
    deliveryLocations,
    setDeliveryLocations,
    pickupQueryKey,
    deliveryQueryKey,
}: ProductFulfillmentSectionProps) {
    const { control } = useFormContext()
    return (
        <div className="border-b border-gray-900/10 dark:border-gray-100/10 pb-12 mt-6">
            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Fulfillment</h2>
            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Where customers can collect or receive this product.</p>
            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                <div className="sm:col-span-6">
                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white mb-2">Pickup Locations</label>
                    <LocationMultiSelect
                        queryKey={pickupQueryKey}
                        allLocations={allLocations}
                        selected={pickupLocations}
                        onChange={setPickupLocations}
                    />
                </div>
                <div className="sm:col-span-6">
                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white mb-2">Delivery Locations</label>
                    <LocationMultiSelect
                        queryKey={deliveryQueryKey}
                        allLocations={allLocations}
                        selected={deliveryLocations}
                        onChange={setDeliveryLocations}
                    />
                </div>
                <div className="sm:col-span-6 flex items-center gap-4">
                    <FormField control={control} name="delivery_available" render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <label className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer" onClick={() => field.onChange(!field.value)}>Delivery Available (free-form address)</label>
                        </FormItem>
                    )} />
                    <FormField control={control} name="pickup_available" render={({ field }) => (
                        <FormItem className="flex items-center gap-2">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <label className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer" onClick={() => field.onChange(!field.value)}>Pick Up Available (tumira api pickup points)</label>
                        </FormItem>
                    )} />
                </div>
            </div>
        </div>
    )
}
