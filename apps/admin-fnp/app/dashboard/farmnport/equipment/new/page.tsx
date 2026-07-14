"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useForm, useFieldArray } from "react-hook-form"
import { useRouter } from "next/navigation"

import { addEquipmentProduct, queryBrands, queryEquipmentCategories, queryClientLocations } from "@/lib/query"
import { FormEquipmentProductSchema, FormEquipmentProductModel, Brand, EquipmentCategory } from "@/lib/schemas"
import { cn, dollarsToCents } from "@/lib/utilities"
import { buttonVariants, Button } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { toast } from "@/components/ui/use-toast"
import { handleApiError, handleFormErrors } from "@/lib/error-handler"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { FileInput } from "@/components/structures/controls/file-input"
import { SelectedLocation } from "@/components/ui/location-multi-select"
import { ProductPricingSection } from "@/components/structures/forms/product-pricing-section"
import { ProductVariantsSection } from "@/components/structures/forms/product-variants-section"
import { ProductFulfillmentSection } from "@/components/structures/forms/product-fulfillment-section"

export default function NewEquipmentProductPage() {
    const router = useRouter()

    const [pickupLocations, setPickupLocations] = useState<SelectedLocation[]>([])
    const [deliveryLocations, setDeliveryLocations] = useState<SelectedLocation[]>([])

    const { data: brandsData } = useQuery({
        queryKey: ["brands-list"],
        queryFn: () => queryBrands(),
        refetchOnWindowFocus: false,
    })

    const { data: categoriesData } = useQuery({
        queryKey: ["equipment-categories-list"],
        queryFn: () => queryEquipmentCategories(),
        refetchOnWindowFocus: false,
    })

    const { data: locationsData } = useQuery({
        queryKey: ["admin-client-locations"],
        queryFn: () => queryClientLocations(),
        refetchOnWindowFocus: false,
    })

    const brands = brandsData?.data?.data as Brand[] || []
    const categories = categoriesData?.data?.data as EquipmentCategory[] || []
    const allLocations: { id: string; name: string; active: boolean }[] = locationsData?.data?.locations ?? []

    const form = useForm<FormEquipmentProductModel>({
        defaultValues: {
            id: "",
            name: "",
            brand_id: "",
            equipment_category_id: "",
            images: [],
            specifications: [],
            stock_level: 0,
            available_for_sale: false,
            sale_price: 0,
            was_price: 0,
            weight_grams: 0,
            variants: [],
            is_test: false,
            status: "active",
            delivery_available: false,
            pickup_available: false,
            pickup_location_ids: [],
            delivery_location_ids: [],
        },
        resolver: zodResolver(FormEquipmentProductSchema),
    })

    const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
        control: form.control,
        name: "variants",
    })

    const watchedVariants = form.watch("variants")

    const { fields: specFields, append: appendSpec, remove: removeSpec } = useFieldArray({
        control: form.control,
        name: "specifications" as any,
    })

    const { mutate, isPending } = useMutation({
        mutationFn: addEquipmentProduct,
        onSuccess: () => {
            toast({
                description: "Product added successfully",
            })
            router.push("/dashboard/farmnport/equipment")
        },
        onError: (error) => {
            handleApiError(error, {
                context: "product creation"
            })
        },
    })

    async function onSubmit(data: FormEquipmentProductModel) {
        mutate({
            ...data,
            sale_price: dollarsToCents(data.sale_price),
            was_price: dollarsToCents(data.was_price),
            variants: data.variants.map(v => ({
                ...v,
                sale_price: dollarsToCents(v.sale_price),
                was_price: dollarsToCents(v.was_price),
                wholesale_price: dollarsToCents(v.wholesale_price ?? 0),
            })),
            pickup_location_ids: pickupLocations.map((l) => l.id),
            delivery_location_ids: deliveryLocations.map((l) => l.id),
        })
    }

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Add Equipment Product
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Create a new equipment product.
                    </p>
                </div>
                <Link
                    href="/dashboard/farmnport/equipment"
                    className={cn(buttonVariants({ variant: "ghost" }))}
                >
                    <Icons.close className="w-4 h-4 mr-2" />
                    Close
                </Link>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, (errors) => handleFormErrors(errors))}>
                    <div className="space-y-12">
                        {/* Basic Info */}
                        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
                            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                                Product Information
                            </h2>
                            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
                                Basic information about the equipment product.
                            </p>

                            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-4">
                                    <label
                                        htmlFor="name"
                                        className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                    >
                                        Product Name
                                    </label>
                                    <div className="mt-2">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            id="name"
                                                            placeholder="e.g., John Deere 5075E, Netafim Drip Kit"
                                                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <p className="mt-3 text-sm/6 text-gray-600 dark:text-gray-400">
                                        Enter the name of the product. The URL-friendly slug will be generated automatically.
                                    </p>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="brand_id" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                        Brand
                                    </label>
                                    <div className="mt-2">
                                        <FormField
                                            control={form.control}
                                            name="brand_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div className="grid grid-cols-1">
                                                            <select
                                                                id="brand_id"
                                                                className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-indigo-500"
                                                                {...field}
                                                            >
                                                                <option value="">Select a brand</option>
                                                                {brands.map((brand) => (
                                                                    <option key={brand.id} value={brand.id}>
                                                                        {brand.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <Icons.chevronDown aria-hidden="true" className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-3">
                                    <label htmlFor="equipment_category_id" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                        Category
                                    </label>
                                    <div className="mt-2">
                                        <FormField
                                            control={form.control}
                                            name="equipment_category_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div className="grid grid-cols-1">
                                                            <select
                                                                id="equipment_category_id"
                                                                className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-indigo-500"
                                                                {...field}
                                                            >
                                                                <option value="">Select a category</option>
                                                                {categories.map((cat) => (
                                                                    <option key={cat.id} value={cat.id}>
                                                                        {cat.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <Icons.chevronDown aria-hidden="true" className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label htmlFor="status" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                        Status
                                    </label>
                                    <div className="mt-2">
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <div className="grid grid-cols-1">
                                                            <select
                                                                id="status"
                                                                className="col-start-1 row-start-1 w-full appearance-none rounded-md bg-white py-1.5 pl-3 pr-8 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-indigo-500"
                                                                {...field}
                                                            >
                                                                <option value="active">Active</option>
                                                                <option value="inactive">Inactive</option>
                                                            </select>
                                                            <Icons.chevronDown aria-hidden="true" className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4 dark:text-gray-400" />
                                                        </div>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ProductPricingSection />

                        <ProductVariantsSection
                            variantFields={variantFields}
                            appendVariant={appendVariant}
                            removeVariant={removeVariant}
                            watchedVariants={watchedVariants}
                        />

                        {/* Images */}
                        <div className="border-b border-gray-900/10 dark:border-gray-100/10 pb-12">
                            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Product Images</h2>
                            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Upload images for this product.</p>

                            <div className="mt-6">
                                <FormField
                                    control={form.control}
                                    name="images"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <FileInput
                                                    id="new-equipment"
                                                    fieldName="images"
                                                    entityType="equipment"
                                                    value={field.value || []}
                                                    onChange={field.onChange}
                                                    maxImages={5}
                                                    showPlaceholders={true}
                                                    thumbnailClassName="inline-flex flex-col overflow-hidden border border-gray-200 rounded-lg mt-2 me-2 relative bg-white shadow-sm"
                                                    imageClassName="flex items-center justify-center w-32 h-32 overflow-hidden bg-gray-50"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {/* Specifications */}
                        <div className="border-b border-gray-900/10 dark:border-gray-100/10 pb-12">
                            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Specifications</h2>
                            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
                                Technical specifications and key features for this product.
                            </p>

                            <div className="mt-6 space-y-3">
                                {specFields.map((field, index) => (
                                    <div key={field.id} className="flex items-center gap-3">
                                        <FormField
                                            control={form.control}
                                            name={`specifications.${index}` as any}
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input
                                                            placeholder="e.g. Engine: 75HP, 4-cylinder diesel"
                                                            className="border-0 bg-white dark:bg-white/5 dark:text-white focus-visible:ring-0 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 dark:outline-white/10 dark:focus:outline-indigo-500"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeSpec(index)}
                                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            <Icons.close className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => appendSpec("" as any)}
                            >
                                <Icons.add className="w-4 h-4 mr-1" />
                                Add Specification
                            </Button>
                        </div>
                    </div>

                    <ProductFulfillmentSection
                        allLocations={allLocations}
                        pickupLocations={pickupLocations}
                        setPickupLocations={setPickupLocations}
                        deliveryLocations={deliveryLocations}
                        setDeliveryLocations={setDeliveryLocations}
                        pickupQueryKey="equipment-pickup-locations"
                        deliveryQueryKey="equipment-delivery-locations"
                    />

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/farmnport/equipment")}
                            className="text-sm/6 font-semibold text-gray-900 dark:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                        >
                            {isPending && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}
                            Save
                        </button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
