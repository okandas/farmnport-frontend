"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useForm, FieldErrors } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { useDebounce } from "use-debounce"
import { Check, ChevronsUpDown } from "lucide-react"

import { addAgroChemical, updateAgroChemical, queryBrands, queryBrand } from "@/lib/query"
import {
    FormAgroChemicalModel,
    FormAgroChemicalSchema,
    Brand,
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
import { FileInput } from "@/components/structures/controls/file-input"
import { ActiveIngredientsSelect } from "@/components/structures/forms/activeIngredientsSelect"

interface AgroChemicalFormProps extends React.HTMLAttributes<HTMLDivElement> {
    agroChemical: FormAgroChemicalModel
    mode?: "create" | "edit"
}

export function AgroChemicalForm({ agroChemical, mode = "create" }: AgroChemicalFormProps) {
    const isEditMode = mode === "edit" || !!agroChemical?.id

    const form = useForm({
        defaultValues: {
            id: agroChemical?.id,
            name: agroChemical?.name,
            brand_id: agroChemical?.brand_id,
            front_label: agroChemical?.front_label,
            back_label: agroChemical?.back_label,
            images: agroChemical?.images || [],
            active_ingredients: agroChemical?.active_ingredients || [],
        },
        resolver: zodResolver(FormAgroChemicalSchema),
    })

    const router = useRouter()

    const [searchBrand, setSearchBrand] = useState("")
    const [selectedBrand, setSelectedBrand] = useState("")
    const [open, setOpen] = useState(false)

    // Fetch the current brand in edit mode
    const { data: brandData } = useQuery({
        queryKey: ["brand", agroChemical?.brand_id],
        queryFn: () => queryBrand(agroChemical.brand_id),
        enabled: isEditMode && !!agroChemical?.brand_id,
    })

    // Set the selected brand name when editing
    useEffect(() => {
        if (isEditMode && brandData?.data) {
            const brand = brandData.data as Brand
            setSelectedBrand(brand.name)
        }
    }, [isEditMode, brandData])

    // Debounce search query
    const [debouncedSearchQuery] = useDebounce(searchBrand, 1000)
    const enabled = !!debouncedSearchQuery

    const { data, isError, refetch, error } = useQuery({
        queryKey: ["dashboard-brands", { search: debouncedSearchQuery }],
        queryFn: () =>
            queryBrands({
                search: debouncedSearchQuery,
            }),
        enabled,
    })

    const brands = data?.data?.data as Brand[]

    // Show error toast only once when error occurs
    const hasShownBrandError = useRef(false)
    useEffect(() => {
        if (isError && !hasShownBrandError.current) {
            hasShownBrandError.current = true
            setOpen(false)
            handleFetchError(error, {
                onRetry: () => {
                    hasShownBrandError.current = false
                    refetch()
                },
                context: "brands"
            })
        }
        if (!isError) {
            hasShownBrandError.current = false
        }
    }, [isError, error, refetch])

    const { mutate, isPending } = useMutation({
        mutationFn: isEditMode ? updateAgroChemical : addAgroChemical,
        onSuccess: () => {
            toast({
                description: isEditMode
                    ? "Updated AgroChemical Successfully"
                    : "Added AgroChemical Successfully",
            })

            router.push(`/dashboard/agrochemicals`)
        },
        onError: (error) => {
            handleApiError(error, {
                context: `agrochemical ${isEditMode ? "update" : "creation"}`
            })
        },

    })

    async function onSubmit(payload: FormAgroChemicalModel) {
        logFormPayload(payload, "agrochemical")
        mutate(payload)
    }

    const onError = (errors: FieldErrors<FormAgroChemicalModel>) => {
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
                        AgroChemical Information
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm/6 text-gray-600 dark:text-gray-400">
                        {isEditMode
                            ? "Update the agro chemical product information."
                            : "Add a new agro chemical product to the system."}
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

                        {isEditMode && agroChemical?.slug && (
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
                                        value={agroChemical.slug}
                                        readOnly
                                        disabled
                                        className="block w-full rounded-md bg-gray-50 px-3 py-1.5 text-base text-gray-500 outline outline-1 -outline-offset-1 outline-gray-300 sm:max-w-md sm:text-sm/6 dark:bg-white/5 dark:text-gray-400 dark:outline-white/10 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                            <label
                                htmlFor="brand"
                                className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white"
                            >
                                Brand
                            </label>
                            <div className="mt-2 sm:col-span-2 sm:mt-0">
                                <FormField
                                    control={form.control}
                                    name="brand_id"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <Popover open={open} onOpenChange={setOpen}>
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
                                                            {field.value
                                                                ? selectedBrand
                                                                : "Select brand"}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                                    <Command>
                                                        <CommandInput
                                                            placeholder="Search brand..."
                                                            onValueChange={(value) => {
                                                                setSearchBrand(value)
                                                            }}
                                                        />
                                                        <CommandList>
                                                            <CommandEmpty>
                                                                {searchBrand.length < 2
                                                                    ? "Type at least 2 characters to search"
                                                                    : "No brand found."}
                                                            </CommandEmpty>
                                                            {brands?.map((brand) => (
                                                                <CommandItem
                                                                    value={brand.name}
                                                                    key={brand.id}
                                                                    onSelect={() => {
                                                                        form.setValue("brand_id", brand.id)
                                                                        setSelectedBrand(brand.name)
                                                                        setOpen(false)
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            brand.id === field.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {brand.name}
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
                            <div>
                                <label
                                    htmlFor="images"
                                    className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                >
                                    Product Images <span className="text-red-600">*</span>
                                </label>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Upload product images to showcase this agrochemical.
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
                                                    id={agroChemical?.id}
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
                                                Upload up to 5 product images. At least 1 image is required.
                                            </p>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                        Product Labels
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm/6 text-gray-600 dark:text-gray-400">
                        Upload images for the front and back labels of the product.
                    </p>

                    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white mb-2">
                                Front Label
                            </label>
                            <FormField
                                control={form.control}
                                name="front_label"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <FileInput
                                                id={agroChemical?.id}
                                                fieldName="front_label"
                                                value={field.value ? [field.value] : []}
                                                onChange={(value) => field.onChange(value[0])}
                                                thumbnailClassName="relative overflow-hidden border border-gray-200 rounded-lg bg-white shadow-sm w-full"
                                                imageClassName="flex items-center justify-center w-full h-64 overflow-hidden bg-gray-50"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div>
                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white mb-2">
                                Back Label
                            </label>
                            <FormField
                                control={form.control}
                                name="back_label"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <FileInput
                                                id={agroChemical?.id}
                                                fieldName="back_label"
                                                value={field.value ? [field.value] : []}
                                                onChange={(value) => field.onChange(value[0])}
                                                thumbnailClassName="relative overflow-hidden border border-gray-200 rounded-lg bg-white shadow-sm w-full"
                                                imageClassName="flex items-center justify-center w-full h-64 overflow-hidden bg-gray-50"
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                        Active Ingredients
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm/6 text-gray-600 dark:text-gray-400">
                        Select the active chemical ingredients in this product and specify their dosage amounts.
                    </p>

                    <div className="mt-6">
                        <FormField
                            control={form.control}
                            name="active_ingredients"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <ActiveIngredientsSelect
                                            value={field.value || []}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <div className="mt-6 mb-12 flex items-center justify-end gap-x-6">
                    <button
                        type="button"
                        onClick={() => router.push('/dashboard/agrochemicals')}
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
                        {isEditMode ? "Update AgroChemical" : "Add AgroChemical"}
                    </button>
                </div>
            </form>
        </Form>
    )
}
