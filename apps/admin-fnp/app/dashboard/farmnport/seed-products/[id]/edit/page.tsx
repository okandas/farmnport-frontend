"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import * as z from "zod"

import { querySeedProduct, updateSeedProduct, queryBrands, queryUsers, queryFarmProduceCategories, queryFarmProduceByCategory, queryBreeds, queryClientLocations } from "@/lib/query"
import { cn, dollarsToCents } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { toast } from "@/components/ui/use-toast"
import { handleApiError } from "@/lib/error-handler"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { SearchSelect } from "@/components/ui/search-select"
import { SelectedLocation } from "@/components/ui/location-multi-select"
import { ProductPricingSection } from "@/components/structures/forms/product-pricing-section"
import { ProductFulfillmentSection } from "@/components/structures/forms/product-fulfillment-section"

const inputClass = "block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-primary"

const Schema = z.object({
    name: z.string().default(""),
    category_slug: z.string().optional().default(""),
    breed_id: z.string().optional().default(""),
    brand_id: z.string().optional().default(""),
    seller_id: z.string().optional().default(""),
    farm_produce_id: z.string().optional().default(""),
    description: z.string().optional().default(""),
    planting_season: z.string().optional().default(""),
    days_to_maturity: z.string().optional().default(""),
    yield_potential: z.string().optional().default(""),
    soil_requirements: z.string().optional().default(""),
    seed_treatment: z.string().optional().default(""),
    management_tips: z.string().optional().default(""),
    planting_guide: z.array(z.object({
        step: z.string(),
        notes: z.string(),
    })).default([]),
    precautions: z.array(z.string()).default([]),
    variants: z.array(z.object({
        name: z.string().min(1, "Variant name is required"),
        sku: z.string().default(""),
        sale_price: z.coerce.number().default(0),
        was_price: z.coerce.number().default(0),
        stock_level: z.coerce.number().default(0),
    })).default([]),
    stock_level: z.coerce.number().int().nonnegative().default(0),
    available_for_sale: z.boolean().default(false),
    sale_price: z.coerce.number().default(0),
    was_price: z.coerce.number().default(0),
    weight_grams: z.coerce.number().int().nonnegative().default(0),
    is_test: z.boolean().default(false),
    delivery_available: z.boolean().default(false),
    pickup_available: z.boolean().default(false),
}).refine((data) => !!data.brand_id || !!data.seller_id, {
    message: "Either a Brand or a Client must be selected",
    path: ["brand_id"],
})

type FormModel = z.infer<typeof Schema>

export default function EditSeedProductPage() {
    const params = useParams()
    const id = params.id as string

    const { data, isLoading } = useQuery({
        queryKey: ["seed-product", id],
        queryFn: () => querySeedProduct(id),
        enabled: !!id,
        refetchOnWindowFocus: false,
    })

    if (isLoading) {
        return <div className="flex items-center justify-center py-20"><Icons.spinner className="w-6 h-6 animate-spin text-gray-400" /></div>
    }

    return <EditForm product={data?.data} id={id} />
}

function EditForm({ product, id }: { product: any; id: string }) {
    const router = useRouter()
    const [precautionInput, setPrecautionInput] = useState("")
    const [produceOpen, setProduceOpen] = useState(false)
    const [produceSearch, setProduceSearch] = useState("")
    const [pickupLocations, setPickupLocations] = useState<SelectedLocation[] | null>(null)
    const [deliveryLocations, setDeliveryLocations] = useState<SelectedLocation[] | null>(null)

    const form = useForm<FormModel>({
        defaultValues: {
            name: product?.name || "",
            category_slug: product?.farm_produce?.category_slug || "",
            breed_id: product?.breed_id || "",
            brand_id: product?.brand_id || "",
            seller_id: product?.seller_id || "",
            farm_produce_id: product?.farm_produce_id || "",
            description: product?.description || "",
            planting_season: product?.planting_season || "",
            days_to_maturity: product?.days_to_maturity || "",
            yield_potential: product?.yield_potential || "",
            soil_requirements: product?.soil_requirements || "",
            seed_treatment: product?.seed_treatment || "",
            management_tips: product?.management_tips || "",
            planting_guide: product?.planting_guide || [],
            precautions: product?.precautions || [],
            variants: (product?.variants || []).map((v: any) => ({
                name: v.name || "",
                sku: v.sku || "",
                sale_price: (v.sale_price || 0) / 100,
                was_price: (v.was_price || 0) / 100,
                stock_level: v.stock_level || 0,
            })),
            stock_level: product?.stock_level || 0,
            available_for_sale: product?.available_for_sale || false,
            sale_price: (product?.sale_price || 0) / 100,
            was_price: (product?.was_price || 0) / 100,
            weight_grams: product?.weight_grams ?? 0,
            is_test: (product as any)?.is_test ?? false,
            delivery_available: product?.delivery_available || false,
            pickup_available: (product as any)?.pickup_available || false,
        },
        resolver: zodResolver(Schema),
    })

    const watchedCategorySlug = form.watch("category_slug")
    const watchedFarmProduceId = form.watch("farm_produce_id")

    const { data: produceData } = useQuery({
        queryKey: ["farm-produce-by-category", watchedCategorySlug],
        queryFn: () => queryFarmProduceByCategory(watchedCategorySlug!),
        enabled: !!watchedCategorySlug,
        refetchOnWindowFocus: false,
    })

    const allProduce = produceData?.data?.data || []
    const filteredProduce = produceSearch.length >= 1
        ? allProduce.filter((fp: any) => fp.name.toLowerCase().includes(produceSearch.toLowerCase()))
        : allProduce
    const selectedProduce = allProduce.find((fp: any) => fp.id === watchedFarmProduceId) || product?.farm_produce

    const { data: locationsData } = useQuery({
        queryKey: ["admin-client-locations"],
        queryFn: () => queryClientLocations(),
        refetchOnWindowFocus: false,
    })
    const allLocations: { id: string; name: string; active: boolean }[] = locationsData?.data?.locations ?? []

    if (pickupLocations === null && product && allLocations.length > 0) {
        const ids: string[] = product.pickup_location_ids ?? []
        setPickupLocations(ids.map((id: string) => allLocations.find((l) => l.id === id)).filter(Boolean) as SelectedLocation[])
    }
    if (deliveryLocations === null && product && allLocations.length > 0) {
        const ids: string[] = product.delivery_location_ids ?? []
        setDeliveryLocations(ids.map((id: string) => allLocations.find((l) => l.id === id)).filter(Boolean) as SelectedLocation[])
    }

    const { fields: guideFields, append: appendGuide, remove: removeGuide } = useFieldArray({ control: form.control, name: "planting_guide" })
    const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({ control: form.control, name: "variants" })

    const precautions = form.watch("precautions")

    const { mutate, isPending } = useMutation({
        mutationFn: (data: any) => updateSeedProduct({ id, ...data }),
        onSuccess: () => {
            toast({ description: "Seed product updated successfully" })
            router.push("/dashboard/farmnport/seed-products")
        },
        onError: (error) => handleApiError(error, { context: "seed product update" }),
    })

    function onSubmit(data: FormModel) {
        mutate({
            ...data,
            sale_price: dollarsToCents(data.sale_price),
            was_price: dollarsToCents(data.was_price),
            variants: data.variants.map((v) => ({
                ...v,
                sale_price: dollarsToCents(v.sale_price),
                was_price: dollarsToCents(v.was_price),
            })),
            pickup_location_ids: (pickupLocations ?? []).map((l) => l.id),
            delivery_location_ids: (deliveryLocations ?? []).map((l) => l.id),
        })
    }

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Edit Seed Product</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Update this seed or planting material guide.</p>
                </div>
                <Link href="/dashboard/farmnport/seed-products" className={cn(buttonVariants({ variant: "ghost" }))}>
                    <Icons.close className="w-4 h-4 mr-2" />Close
                </Link>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="space-y-12">

                        {/* Product Information */}
                        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3 dark:border-white/10">
                            <div>
                                <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Product Information</h2>
                                <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Basic details about this seed product.</p>
                            </div>
                            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
                                <div className="sm:col-span-3">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Category</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="category_slug" render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <SearchSelect
                                                        queryKey="farm-produce-categories-select"
                                                        queryFn={(params) => queryFarmProduceCategories(params)}
                                                        getItems={(page) => page?.data?.data || []}
                                                        value={field.value || ""}
                                                        onValueChange={(v) => { field.onChange(v); form.setValue("farm_produce_id", ""); form.setValue("breed_id", "") }}
                                                        getLabel={(cat) => cat.name}
                                                        getValue={(cat) => cat.slug}
                                                        placeholder="Select category"
                                                        searchPlaceholder="Search categories..."
                                                        clearable
                                                        capitalize
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                                <div className="sm:col-span-3">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Farm Produce</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="farm_produce_id" render={({ field }) => (
                                            <FormItem>
                                                <Popover open={produceOpen} onOpenChange={(o) => { setProduceOpen(o); if (!o) setProduceSearch("") }}>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <button
                                                                type="button"
                                                                disabled={!watchedCategorySlug}
                                                                className={cn("w-full flex items-center justify-between rounded-md bg-white dark:bg-white/5 px-3 py-1.5 text-sm text-left outline outline-1 -outline-offset-1 outline-gray-300 dark:outline-white/10 disabled:opacity-50", !field.value && "text-gray-400 dark:text-gray-500")}
                                                            >
                                                                <span className="truncate">{selectedProduce ? selectedProduce.name : watchedCategorySlug ? "Select produce" : "Select category first"}</span>
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                                        <Command shouldFilter={false}>
                                                            <CommandInput placeholder="Search produce..." value={produceSearch} onValueChange={setProduceSearch} />
                                                            <CommandList className="max-h-56">
                                                                <CommandEmpty>No produce found.</CommandEmpty>
                                                                {filteredProduce.map((fp: any) => (
                                                                    <CommandItem key={fp.id} value={fp.id} onSelect={() => { field.onChange(fp.id); form.setValue("breed_id", ""); setProduceOpen(false); setProduceSearch("") }} className="capitalize">
                                                                        <Check className={cn("mr-2 h-4 w-4 shrink-0", fp.id === field.value ? "opacity-100" : "opacity-0")} />
                                                                        {fp.name}
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                                <div className="sm:col-span-3">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Client</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="seller_id" render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <SearchSelect
                                                        queryKey="users-select"
                                                        queryFn={(params) => queryUsers(params)}
                                                        getItems={(page) => page?.data?.data || []}
                                                        value={field.value || ""}
                                                        onValueChange={field.onChange}
                                                        getLabel={(u) => u.name}
                                                        getValue={(u) => u.id}
                                                        placeholder="Select client"
                                                        searchPlaceholder="Search clients..."
                                                        clearable
                                                        capitalize
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                                <div className="sm:col-span-3">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Brand</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="brand_id" render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <SearchSelect
                                                        queryKey="brands-select"
                                                        queryFn={(params) => queryBrands(params)}
                                                        getItems={(page) => page?.data?.data || []}
                                                        value={field.value || ""}
                                                        onValueChange={field.onChange}
                                                        getLabel={(b) => b.name}
                                                        getValue={(b) => b.id}
                                                        placeholder="Select brand"
                                                        searchPlaceholder="Search brands..."
                                                        clearable
                                                        capitalize
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                                <div className="sm:col-span-3">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Variety / Breed</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="breed_id" render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <SearchSelect
                                                        queryKey={["breeds-select", watchedFarmProduceId]}
                                                        queryFn={(params) => queryBreeds({ ...params, farm_produce_id: watchedFarmProduceId })}
                                                        getItems={(page) => page?.data?.data || []}
                                                        value={field.value || ""}
                                                        onValueChange={field.onChange}
                                                        getLabel={(b) => b.name}
                                                        getValue={(b) => b.id}
                                                        placeholder="Select variety"
                                                        searchPlaceholder="Search varieties..."
                                                        disabled={!watchedFarmProduceId}
                                                        clearable
                                                        capitalize
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                                <div className="sm:col-span-6">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Description</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="description" render={({ field }) => (
                                            <FormItem><FormControl><Textarea placeholder="Brief overview of this seed product" rows={3} className={inputClass} {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Growing Guide */}
                        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3 dark:border-white/10">
                            <div>
                                <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Growing Guide</h2>
                                <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Agronomic details for the guide page.</p>
                            </div>
                            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
                                <div className="sm:col-span-3">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Planting Season</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="planting_season" render={({ field }) => (
                                            <FormItem><FormControl><Input placeholder="e.g. March–May / July–September" className={inputClass} {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                </div>
                                <div className="sm:col-span-3">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Days to Maturity</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="days_to_maturity" render={({ field }) => (
                                            <FormItem><FormControl><Input placeholder="e.g. 90–110 days" className={inputClass} {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                </div>
                                <div className="sm:col-span-3">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Yield Potential</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="yield_potential" render={({ field }) => (
                                            <FormItem><FormControl><Input placeholder="e.g. 35–45 tonnes/ha" className={inputClass} {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                </div>
                                <div className="sm:col-span-3">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Seed Treatment</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="seed_treatment" render={({ field }) => (
                                            <FormItem><FormControl><Input placeholder="e.g. Certified, disease-free" className={inputClass} {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                </div>
                                <div className="sm:col-span-6">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Soil Requirements</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="soil_requirements" render={({ field }) => (
                                            <FormItem><FormControl><Textarea placeholder="e.g. Well-drained, pH 5.5–6.5, high organic matter" rows={3} className={inputClass} {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                </div>
                                <div className="sm:col-span-6">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Management Tips</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="management_tips" render={({ field }) => (
                                            <FormItem><FormControl><Textarea placeholder="Key agronomic guidance for farmers" rows={3} className={inputClass} {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Planting Guide Steps */}
                        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3 dark:border-white/10">
                            <div>
                                <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Planting Guide Steps</h2>
                                <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Step-by-step planting instructions.</p>
                            </div>
                            <div className="md:col-span-2">
                                <div className="flex justify-end mb-4">
                                    <button type="button" onClick={() => appendGuide({ step: "", notes: "" })}
                                        className="inline-flex items-center rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-primary/90">
                                        <Icons.add className="w-3.5 h-3.5 mr-1" />Add Step
                                    </button>
                                </div>
                                {guideFields.length > 0 && (
                                    <div className="space-y-3">
                                        {guideFields.map((field, index) => (
                                            <div key={field.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Step</label>
                                                        <Input placeholder="e.g. Land Preparation" className="text-sm" {...form.register(`planting_guide.${index}.step`)} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                                                        <Input placeholder="e.g. Deep plough to 30cm, remove clods" className="text-sm" {...form.register(`planting_guide.${index}.notes`)} />
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => removeGuide(index)} className="mt-5 text-red-500 hover:text-red-700">
                                                    <Icons.trash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Precautions */}
                        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3 dark:border-white/10">
                            <div>
                                <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Precautions</h2>
                                <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Important handling and storage notes.</p>
                            </div>
                            <div className="md:col-span-2">
                                <div className="flex gap-2">
                                    <Input value={precautionInput} onChange={(e) => setPrecautionInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (precautionInput.trim()) { form.setValue("precautions", [...precautions, precautionInput.trim()]); setPrecautionInput("") } } }}
                                        placeholder="Type a precaution and press Enter" className={inputClass} />
                                    <button type="button" onClick={() => { if (precautionInput.trim()) { form.setValue("precautions", [...precautions, precautionInput.trim()]); setPrecautionInput("") } }}
                                        className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white hover:bg-primary/90">Add</button>
                                </div>
                                {precautions.length > 0 && (
                                    <ul className="mt-3 space-y-1">
                                        {precautions.map((p, i) => (
                                            <li key={i} className="flex items-center justify-between rounded-md bg-gray-50 dark:bg-white/5 px-3 py-2 text-sm">
                                                {p}
                                                <button type="button" onClick={() => form.setValue("precautions", precautions.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700 ml-3"><Icons.close className="w-3.5 h-3.5" /></button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>

                        {/* Variants */}
                        <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3 dark:border-white/10">
                            <div>
                                <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Pack Sizes / Variants</h2>
                                <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">e.g. Small Tubers – 25kg, Certified Seed – 50kg</p>
                            </div>
                            <div className="md:col-span-2">
                                <div className="flex justify-end mb-4">
                                    <button type="button" onClick={() => appendVariant({ name: "", sku: "", sale_price: 0, was_price: 0, stock_level: 0 })}
                                        className="inline-flex items-center rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-primary/90">
                                        <Icons.add className="w-3.5 h-3.5 mr-1" />Add Variant
                                    </button>
                                </div>
                                {variantFields.length > 0 && (
                                    <div className="space-y-3">
                                        {variantFields.map((field, index) => (
                                            <div key={field.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-5 gap-3">
                                                    <div className="sm:col-span-2">
                                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                                        <Input placeholder="e.g. Small Tubers – 25kg" className="text-sm" {...form.register(`variants.${index}.name`)} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">SKU</label>
                                                        <Input placeholder="Optional" className="text-sm" {...form.register(`variants.${index}.sku`)} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Sale Price ($)</label>
                                                        <Input type="number" step="0.01" min="0" placeholder="0.00" className="text-sm" {...form.register(`variants.${index}.sale_price`)} />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
                                                        <Input type="number" min="0" placeholder="0" className="text-sm" {...form.register(`variants.${index}.stock_level`)} />
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => removeVariant(index)} className="mt-4 text-red-500 hover:text-red-700">
                                                    <Icons.trash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <ProductPricingSection />

                        <ProductFulfillmentSection
                            allLocations={allLocations}
                            pickupLocations={pickupLocations ?? []}
                            setPickupLocations={setPickupLocations}
                            deliveryLocations={deliveryLocations ?? []}
                            setDeliveryLocations={setDeliveryLocations}
                            pickupQueryKey="seed-pickup-locations"
                            deliveryQueryKey="seed-delivery-locations"
                        />

                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button type="button" onClick={() => router.push("/dashboard/farmnport/seed-products")} className="text-sm/6 font-semibold text-gray-900 dark:text-white">Cancel</button>
                        <button type="submit" disabled={isPending}
                            className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isPending && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}Save Changes
                        </button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
