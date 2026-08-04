"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useForm, useFieldArray, FieldErrors } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { useDebounce } from "use-debounce"
import { Check, ChevronsUpDown } from "lucide-react"

import { addTurtlewaxProduct, updateTurtlewaxProduct, queryClientLocations, queryTurtlewaxCategories, queryTurtlewaxCategory } from "@/lib/query"
import {
    FormTurtlewaxProductModel,
    FormTurtlewaxProductSchema,
    TurtlewaxCategory,
} from "@/lib/schemas"
import { cn, logFormPayload } from "@/lib/utilities"
import { handleApiError, handleFetchError, handleFormErrors } from "@/lib/error-handler"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons/lucide"
import {
    Command,
    CommandInput,
    CommandItem,
    CommandList,
    CommandEmpty,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { FileInput } from "@/components/structures/controls/file-input"
import { LocationMultiSelect, SelectedLocation } from "@/components/ui/location-multi-select"

interface TurtlewaxProductFormProps extends React.HTMLAttributes<HTMLDivElement> {
    product: FormTurtlewaxProductModel
    mode?: "create" | "edit"
}

export function TurtlewaxProductForm({ product, mode = "create" }: TurtlewaxProductFormProps) {
    const isEditMode = mode === "edit" || !!product?.id

    const form = useForm({
        defaultValues: {
            id: product?.id,
            name: product?.name,
            sku: product?.sku || "",
            turtlewax_category_id: product?.turtlewax_category_id || "",
            images: product?.images || [],
            variants: (product?.variants || []).map((v: any) => ({
                ...v,
                sale_price: v.sale_price ? v.sale_price / 100 : 0,
                was_price: v.was_price ? v.was_price / 100 : 0,
                wholesale_price: v.wholesale_price ? v.wholesale_price / 100 : 0,
            })),
            product_overview: product?.product_overview || "",
            stock_level: product?.stock_level ?? 0,
            available_for_sale: product?.available_for_sale ?? false,
            sale_price: product?.sale_price ?? 0,
            show_was_price: product?.show_was_price ?? false,
            was_price: product?.was_price ?? 0,
            weight_grams: product?.weight_grams ?? 0,
            is_test: product?.is_test ?? false,
            delivery_available: product?.delivery_available ?? false,
            pickup_available: product?.pickup_available ?? false,
            pickup_location_ids: product?.pickup_location_ids ?? [],
            delivery_location_ids: product?.delivery_location_ids ?? [],
        },
        resolver: zodResolver(FormTurtlewaxProductSchema),
    })

    const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
        control: form.control,
        name: "variants",
    })

    const router = useRouter()

    const [searchCategory, setSearchCategory] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("")
    const [openCategory, setOpenCategory] = useState(false)

    // Fetch the current category in edit mode
    const { data: categoryData } = useQuery({
        queryKey: ["turtlewax-category", product?.turtlewax_category_id],
        queryFn: () => queryTurtlewaxCategory(product.turtlewax_category_id!),
        enabled: isEditMode && !!product?.turtlewax_category_id,
    })

    useEffect(() => {
        if (isEditMode && categoryData?.data) {
            const category = categoryData.data as TurtlewaxCategory
            setSelectedCategory(category.name)
        }
    }, [isEditMode, categoryData])

    // Debounce search query for categories
    const [debouncedCategorySearch] = useDebounce(searchCategory, 1000)
    const enabledCategory = !!debouncedCategorySearch

    const { data: categoriesData, isError: isCategoryError, refetch: refetchCategories, error: categoryError } = useQuery({
        queryKey: ["dashboard-turtlewax-categories", { search: debouncedCategorySearch }],
        queryFn: () =>
            queryTurtlewaxCategories({
                search: debouncedCategorySearch,
            }),
        enabled: enabledCategory,
    })

    const categories = categoriesData?.data?.data as TurtlewaxCategory[]

    const hasShownCategoryError = useRef(false)
    useEffect(() => {
        if (isCategoryError && !hasShownCategoryError.current) {
            hasShownCategoryError.current = true
            setOpenCategory(false)
            handleFetchError(categoryError, {
                onRetry: () => {
                    hasShownCategoryError.current = false
                    refetchCategories()
                },
                context: "turtlewax categories"
            })
        }
        if (!isCategoryError) {
            hasShownCategoryError.current = false
        }
    }, [isCategoryError, categoryError, refetchCategories])

    const [pickupLocations, setPickupLocations] = useState<SelectedLocation[] | null>(null)
    const [deliveryLocations, setDeliveryLocations] = useState<SelectedLocation[] | null>(null)

    const { data: locationsData } = useQuery({
        queryKey: ["admin-client-locations"],
        queryFn: () => queryClientLocations(),
        refetchOnWindowFocus: false,
    })
    const allLocations: { id: string; name: string; active: boolean }[] = locationsData?.data?.locations ?? []

    if (pickupLocations === null && allLocations.length > 0) {
        const ids: string[] = product?.pickup_location_ids ?? []
        setPickupLocations(ids.map((id: string) => allLocations.find((l) => l.id === id)).filter(Boolean) as SelectedLocation[])
    }
    if (deliveryLocations === null && allLocations.length > 0) {
        const ids: string[] = product?.delivery_location_ids ?? []
        setDeliveryLocations(ids.map((id: string) => allLocations.find((l) => l.id === id)).filter(Boolean) as SelectedLocation[])
    }

    const { mutate, isPending } = useMutation({
        mutationFn: isEditMode ? updateTurtlewaxProduct : addTurtlewaxProduct,
        onSuccess: () => {
            toast({
                description: isEditMode
                    ? "Updated Turtlewax Product Successfully"
                    : "Added Turtlewax Product Successfully",
            })

            router.push(`/dashboard/turtlewax/products`)
        },
        onError: (error) => {
            handleApiError(error, {
                context: `turtlewax product ${isEditMode ? "update" : "creation"}`
            })
        },
    })

    async function onSubmit(payload: FormTurtlewaxProductModel) {
        const transformed = {
            ...payload,
            variants: (payload.variants || []).map((v: any) => ({
                ...v,
                sale_price: Math.round(v.sale_price * 100),
                was_price: Math.round(v.was_price * 100),
            })),
            pickup_location_ids: (pickupLocations ?? []).map((l) => l.id),
            delivery_location_ids: (deliveryLocations ?? []).map((l) => l.id),
        }
        logFormPayload(transformed, "turtlewax-product")
        mutate(transformed)
    }

    const onError = (errors: FieldErrors<FormTurtlewaxProductModel>) => {
        handleFormErrors(errors)
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit, onError)}
                className="space-y-12 sm:space-y-16 pb-16"
            >
                <div>
                    <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                        Turtlewax Product Information
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm/6 text-gray-600 dark:text-gray-400">
                        {isEditMode
                            ? "Update the Turtlewax product information."
                            : "Add a new Turtlewax product to the system."}
                    </p>

                    <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:border-t-gray-900/10 sm:pb-0 dark:border-white/10 dark:sm:divide-white/10 dark:sm:border-t-white/10">
                        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                            <label
                                htmlFor="name"
                                className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white"
                            >
                                Name
                            </label>
                            <div className="mt-2 sm:col-span-2 sm:mt-0">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    id="name"
                                                    placeholder="Product name"
                                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:max-w-md sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                            <label
                                htmlFor="sku"
                                className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white"
                            >
                                SKU
                            </label>
                            <div className="mt-2 sm:col-span-2 sm:mt-0">
                                <FormField
                                    control={form.control}
                                    name="sku"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    id="sku"
                                                    placeholder="e.g. 53099"
                                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:max-w-md sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                            <label
                                htmlFor="category"
                                className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white"
                            >
                                Category
                            </label>
                            <div className="mt-2 sm:col-span-2 sm:mt-0">
                                <FormField
                                    control={form.control}
                                    name="turtlewax_category_id"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <Popover open={openCategory} onOpenChange={setOpenCategory}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className={cn(
                                                                "w-full justify-between sm:max-w-md",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <span className="truncate">
                                                                {field.value
                                                                    ? selectedCategory
                                                                    : "Select category"}
                                                            </span>
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                                    <Command>
                                                        <CommandInput
                                                            placeholder="Search category..."
                                                            onValueChange={(value) => {
                                                                setSearchCategory(value)
                                                            }}
                                                        />
                                                        <CommandList>
                                                            <CommandEmpty>
                                                                {searchCategory.length < 2
                                                                    ? "Type at least 2 characters to search"
                                                                    : "No category found."}
                                                            </CommandEmpty>
                                                            {categories?.map((category) => (
                                                                <CommandItem
                                                                    value={category.name}
                                                                    key={category.id}
                                                                    onSelect={() => {
                                                                        form.setValue("turtlewax_category_id", category.id)
                                                                        setSelectedCategory(category.name)
                                                                        setOpenCategory(false)
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            category.id === field.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {category.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                            <label
                                htmlFor="product_overview"
                                className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white"
                            >
                                Product Overview
                            </label>
                            <div className="mt-2 sm:col-span-2 sm:mt-0">
                                <FormField
                                    control={form.control}
                                    name="product_overview"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea
                                                    id="product_overview"
                                                    placeholder="Enter a product description..."
                                                    className="sm:max-w-2xl px-3 py-2"
                                                    rows={4}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        {isEditMode && product?.slug && (
                            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                                <label
                                    htmlFor="slug"
                                    className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white"
                                >
                                    Slug
                                </label>
                                <div className="mt-2 sm:col-span-2 sm:mt-0">
                                    <Input
                                        id="slug"
                                        value={product.slug}
                                        readOnly
                                        disabled
                                        className="block w-full rounded-md bg-gray-50 px-3 py-1.5 text-base text-gray-500 outline outline-1 -outline-offset-1 outline-gray-300 sm:max-w-md sm:text-sm/6 dark:bg-white/5 dark:text-gray-400 dark:outline-white/10 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                            <div>
                                <label
                                    htmlFor="images"
                                    className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                >
                                    Product Images
                                </label>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Upload product images.
                                </p>
                            </div>
                            <div className="mt-2 sm:col-span-2 sm:mt-0">
                                <FormField
                                    control={form.control}
                                    name="images"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <FileInput
                                                    id={product?.id}
                                                    fieldName="images"
                                                    value={field.value || []}
                                                    onChange={field.onChange}
                                                    maxImages={5}
                                                    showPlaceholders={true}
                                                    thumbnailClassName="inline-flex flex-col overflow-hidden border border-gray-200 rounded-lg mt-2 me-2 relative bg-white shadow-sm"
                                                    imageClassName="flex items-center justify-center w-32 h-32 overflow-hidden bg-gray-50"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                            <p className="mt-2 text-xs text-gray-500">
                                                Upload up to 5 product images.
                                            </p>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Variants / Pack Sizes */}
                <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
                    <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                        Pack Sizes &amp; Variants
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm/6 text-gray-600 dark:text-gray-400">
                        Add pack size variants with individual pricing and stock levels.
                    </p>

                    <div className="mt-6 space-y-4">
                        {variantFields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-1 gap-3 sm:grid-cols-5 items-end rounded-lg border border-gray-200 dark:border-white/10 p-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                    <FormField
                                        control={form.control}
                                        name={`variants.${index}.name`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder="e.g. 500ml, 1L, 5L" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Sale Price (USD)</label>
                                    <FormField
                                        control={form.control}
                                        name={`variants.${index}.sale_price`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Was Price (USD)</label>
                                    <FormField
                                        control={form.control}
                                        name={`variants.${index}.was_price`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input type="number" min="0" step="0.01" placeholder="0.00" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Weight (g)</label>
                                    <FormField
                                        control={form.control}
                                        name={`variants.${index}.weight_grams`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input type="number" min="0" placeholder="0" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex items-end gap-2">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
                                        <FormField
                                            control={form.control}
                                            name={`variants.${index}.stock_level`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="number" min="0" placeholder="0" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(index)} className="text-red-500 hover:text-red-700 mb-0.5">
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendVariant({ sku: "", name: "", sale_price: 0, was_price: 0, weight_grams: 0, stock_level: 0, wholesale_price: 0 })}
                        >
                            + Add Pack Size
                        </Button>
                    </div>
                </div>

                {/* Pricing & Stock */}
                <div className="border-b border-gray-900/10 dark:border-gray-100/10 pb-12">
                    <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Pricing & Stock</h2>
                    <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Pricing and inventory information.</p>

                    <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                        <div className="sm:col-span-3 flex items-center gap-4">
                            <FormField
                                control={form.control}
                                name="available_for_sale"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <label className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer" onClick={() => field.onChange(!field.value)}>
                                            Available for Sale
                                        </label>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="is_test"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <label className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer" onClick={() => field.onChange(!field.value)}>
                                            Test item
                                        </label>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <FormField
                                control={form.control}
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
                                control={form.control}
                                name="show_was_price"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2 mb-2">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <label className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer" onClick={() => field.onChange(!field.value)}>
                                            Show Was Price
                                        </label>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
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
                                control={form.control}
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
                                control={form.control}
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

                {/* Fulfillment */}
                <div className="border-b border-gray-900/10 dark:border-gray-100/10 pb-12">
                    <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Fulfillment</h2>
                    <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Where customers can collect or receive this product.</p>
                    <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                        <div className="sm:col-span-6">
                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white mb-2">Pickup Locations</label>
                            <LocationMultiSelect
                                queryKey="turtlewax-pickup-locations"
                                allLocations={allLocations}
                                selected={pickupLocations ?? []}
                                onChange={setPickupLocations}
                            />
                        </div>
                        <div className="sm:col-span-6">
                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white mb-2">Delivery Locations</label>
                            <LocationMultiSelect
                                queryKey="turtlewax-delivery-locations"
                                allLocations={allLocations}
                                selected={deliveryLocations ?? []}
                                onChange={setDeliveryLocations}
                            />
                        </div>
                        <div className="sm:col-span-6 flex items-center gap-4">
                            <FormField control={form.control} name="delivery_available" render={({ field }) => (
                                <FormItem className="flex items-center gap-2">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <label className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer" onClick={() => field.onChange(!field.value)}>Delivery Available (free-form address)</label>
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="pickup_available" render={({ field }) => (
                                <FormItem className="flex items-center gap-2">
                                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                    <label className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer" onClick={() => field.onChange(!field.value)}>Pick Up Available (tumira api pickup points)</label>
                                </FormItem>
                            )} />
                        </div>
                    </div>
                </div>

                <div className="mt-6 mb-12 flex items-center justify-end gap-x-6">
                    <button
                        type="button"
                        onClick={() => router.push('/dashboard/turtlewax/products')}
                        className="text-sm/6 font-semibold text-gray-900 dark:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                    >
                        {isPending && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}
                        {isEditMode ? "Update Product" : "Add Product"}
                    </button>
                </div>
            </form>
        </Form>
    )
}
