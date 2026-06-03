"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import * as z from "zod"

import { addLivestockPoultryProduct, queryBrands, queryFarmProduce } from "@/lib/query"
import { Brand } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { toast } from "@/components/ui/use-toast"
import { handleApiError } from "@/lib/error-handler"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ProductPricingSection } from "@/components/structures/forms/product-pricing-section"

const inputClass = "block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"

const Schema = z.object({
    name: z.string().min(1, "Name is required"),
    species: z.string().min(1, "Species is required"),
    type: z.string().min(1, "Type is required"),
    breed: z.string().optional().default(""),
    brand_id: z.string().optional().default(""),
    seller_id: z.string().optional().default(""),
    farm_produce_id: z.string().optional().default(""),
    description: z.string().optional().default(""),
    product_overview: z.string().optional().default(""),
    performance_metrics: z.string().optional().default(""),
    housing_requirements: z.string().optional().default(""),
    management_tips: z.string().optional().default(""),
    precautions: z.array(z.string()).default([]),
    feeding_stages: z.array(z.object({
        stage: z.string(),
        feed: z.string(),
        amount: z.string(),
        notes: z.string(),
    })).default([]),
    vaccination_schedule: z.array(z.object({
        age: z.string(),
        vaccine: z.string(),
        route: z.string(),
        notes: z.string(),
    })).default([]),
    variants: z.array(z.object({
        name: z.string().min(1, "Variant name is required"),
        sku: z.string().default(""),
        sale_price: z.coerce.number().default(0),
        was_price: z.coerce.number().default(0),
        stock_level: z.coerce.number().default(0),
    })).default([]),
    stock_level: z.coerce.number().int().nonnegative().default(0),
    available_for_sale: z.boolean().default(false),
    show_price: z.boolean().default(false),
    sale_price: z.coerce.number().default(0),
    was_price: z.coerce.number().default(0),
    weight_grams: z.coerce.number().int().nonnegative().default(0),
})

type FormModel = z.infer<typeof Schema>

export default function NewLivestockPoultryPage() {
    const router = useRouter()
    const [precautionInput, setPrecautionInput] = useState("")

    const form = useForm<FormModel>({
        defaultValues: {
            name: "", species: "", type: "", breed: "", brand_id: "", seller_id: "",
            farm_produce_id: "", description: "", product_overview: "",
            performance_metrics: "", housing_requirements: "", management_tips: "",
            precautions: [], feeding_stages: [], vaccination_schedule: [], variants: [],
            stock_level: 0, available_for_sale: false, show_price: false, sale_price: 0, was_price: 0, weight_grams: 0,
        },
        resolver: zodResolver(Schema),
    })

    const { data: brandsData } = useQuery({ queryKey: ["brands-list"], queryFn: () => queryBrands(), refetchOnWindowFocus: false })
    const { data: farmProduceData } = useQuery({ queryKey: ["farm-produce-list"], queryFn: () => queryFarmProduce(), refetchOnWindowFocus: false })

    const brands = brandsData?.data?.data as Brand[] || []
    const farmProduce = farmProduceData?.data?.data || []

    const { fields: feedingFields, append: appendFeeding, remove: removeFeeding } = useFieldArray({ control: form.control, name: "feeding_stages" })
    const { fields: vaccinationFields, append: appendVaccination, remove: removeVaccination } = useFieldArray({ control: form.control, name: "vaccination_schedule" })
    const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({ control: form.control, name: "variants" })

    const precautions = form.watch("precautions")

    const { mutate, isPending } = useMutation({
        mutationFn: addLivestockPoultryProduct,
        onSuccess: () => {
            toast({ description: "Product added successfully" })
            router.push("/dashboard/farmnport/livestock-poultry")
        },
        onError: (error) => handleApiError(error, { context: "livestock poultry creation" }),
    })

    function onSubmit(data: FormModel) {
        mutate(data)
    }

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Add Livestock / Poultry Product</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Create a new guide and listing.</p>
                </div>
                <Link href="/dashboard/farmnport/livestock-poultry" className={cn(buttonVariants({ variant: "ghost" }))}>
                    <Icons.close className="w-4 h-4 mr-2" />Close
                </Link>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="space-y-12">

                        {/* Product Information */}
                        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
                            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Product Information</h2>
                            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Basic details about this livestock or poultry product.</p>

                            <div className="mt-10 space-y-8">
                                <div className="px-1">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Product Name</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="name" render={({ field }) => (
                                            <FormItem>
                                                <FormControl><Input placeholder="e.g. Ross 308 Broiler Day Old Chicks" className={inputClass} {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>

                                <div className="px-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Species</label>
                                        <div className="mt-2">
                                            <FormField control={form.control} name="species" render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <select className={inputClass} {...field}>
                                                            <option value="">Select species</option>
                                                            <option value="poultry">Poultry</option>
                                                            <option value="cattle">Cattle</option>
                                                            <option value="pigs">Pigs</option>
                                                            <option value="sheep">Sheep</option>
                                                            <option value="goats">Goats</option>
                                                            <option value="fish">Fish</option>
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Type</label>
                                        <div className="mt-2">
                                            <FormField control={form.control} name="type" render={({ field }) => (
                                                <FormItem>
                                                    <FormControl><Input placeholder="e.g. Broiler, Layer, Beef, Dairy, Weaner" className={inputClass} {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Breed</label>
                                        <div className="mt-2">
                                            <FormField control={form.control} name="breed" render={({ field }) => (
                                                <FormItem>
                                                    <FormControl><Input placeholder="e.g. Ross 308, Lohmann Brown, Brahman" className={inputClass} {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Brand</label>
                                        <div className="mt-2">
                                            <FormField control={form.control} name="brand_id" render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <select className={inputClass} {...field}>
                                                            <option value="">Select brand</option>
                                                            {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Farm Produce</label>
                                        <div className="mt-2">
                                            <FormField control={form.control} name="farm_produce_id" render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <select className={inputClass} {...field}>
                                                            <option value="">Select produce</option>
                                                            {farmProduce.map((fp: any) => <option key={fp.id} value={fp.id}>{fp.name}</option>)}
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </div>
                                </div>

                                <div className="px-1">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Description</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="description" render={({ field }) => (
                                            <FormItem>
                                                <FormControl><Textarea placeholder="Brief overview of the product" rows={3} className={inputClass} {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>

                                <div className="px-1">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Product Overview</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="product_overview" render={({ field }) => (
                                            <FormItem>
                                                <FormControl><Textarea placeholder="Detailed product overview for the guide page" rows={4} className={inputClass} {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>

                                <div className="px-1">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Performance Metrics</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="performance_metrics" render={({ field }) => (
                                            <FormItem>
                                                <FormControl><Textarea placeholder="e.g. FCR: 1.8, Days to market: 35, Egg production: 320/year" rows={3} className={inputClass} {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>

                                <div className="px-1">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Housing Requirements</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="housing_requirements" render={({ field }) => (
                                            <FormItem>
                                                <FormControl><Textarea placeholder="e.g. 40 chicks per sqm during brooding" rows={3} className={inputClass} {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>

                                <div className="px-1">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Management Tips</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="management_tips" render={({ field }) => (
                                            <FormItem>
                                                <FormControl><Textarea placeholder="Key management guidance for farmers" rows={3} className={inputClass} {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Feeding Stages */}
                        <div className="border-b border-gray-900/10 dark:border-white/10 pb-12">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Feeding Stages</h2>
                                    <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Stage-by-stage feeding program.</p>
                                </div>
                                <button type="button" onClick={() => appendFeeding({ stage: "", feed: "", amount: "", notes: "" })}
                                    className="inline-flex items-center rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400">
                                    <Icons.add className="w-3.5 h-3.5 mr-1" />Add Stage
                                </button>
                            </div>
                            {feedingFields.length > 0 && (
                                <div className="mt-4 space-y-3">
                                    {feedingFields.map((field, index) => (
                                        <div key={field.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Stage</label>
                                                    <Input placeholder="e.g. Starter (Day 1–14)" className="text-sm" {...form.register(`feeding_stages.${index}.stage`)} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Feed</label>
                                                    <Input placeholder="e.g. Broiler Starter 22%" className="text-sm" {...form.register(`feeding_stages.${index}.feed`)} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
                                                    <Input placeholder="e.g. Ad lib, 50g/bird/day" className="text-sm" {...form.register(`feeding_stages.${index}.amount`)} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                                                    <Input placeholder="e.g. Contains coccidiostat" className="text-sm" {...form.register(`feeding_stages.${index}.notes`)} />
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => removeFeeding(index)} className="mt-5 text-red-500 hover:text-red-700 dark:text-red-400">
                                                <Icons.trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Vaccination Schedule */}
                        <div className="border-b border-gray-900/10 dark:border-white/10 pb-12">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Vaccination Schedule</h2>
                                    <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Recommended vaccination events.</p>
                                </div>
                                <button type="button" onClick={() => appendVaccination({ age: "", vaccine: "", route: "", notes: "" })}
                                    className="inline-flex items-center rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400">
                                    <Icons.add className="w-3.5 h-3.5 mr-1" />Add Entry
                                </button>
                            </div>
                            {vaccinationFields.length > 0 && (
                                <div className="mt-4 space-y-3">
                                    {vaccinationFields.map((field, index) => (
                                        <div key={field.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Age</label>
                                                    <Input placeholder="e.g. Day 1, Week 2" className="text-sm" {...form.register(`vaccination_schedule.${index}.age`)} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Vaccine</label>
                                                    <Input placeholder="e.g. Newcastle Disease (La Sota)" className="text-sm" {...form.register(`vaccination_schedule.${index}.vaccine`)} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Route</label>
                                                    <Input placeholder="e.g. Eye drop, Drinking water" className="text-sm" {...form.register(`vaccination_schedule.${index}.route`)} />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                                                    <Input placeholder="Optional notes" className="text-sm" {...form.register(`vaccination_schedule.${index}.notes`)} />
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => removeVaccination(index)} className="mt-5 text-red-500 hover:text-red-700 dark:text-red-400">
                                                <Icons.trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Precautions */}
                        <div className="border-b border-gray-900/10 dark:border-white/10 pb-12">
                            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Precautions</h2>
                            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Important handling and biosecurity notes.</p>
                            <div className="mt-4 flex gap-2">
                                <Input
                                    value={precautionInput}
                                    onChange={(e) => setPrecautionInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault()
                                            if (precautionInput.trim()) {
                                                form.setValue("precautions", [...precautions, precautionInput.trim()])
                                                setPrecautionInput("")
                                            }
                                        }
                                    }}
                                    placeholder="Type a precaution and press Enter"
                                    className={inputClass}
                                />
                                <button type="button" onClick={() => {
                                    if (precautionInput.trim()) {
                                        form.setValue("precautions", [...precautions, precautionInput.trim()])
                                        setPrecautionInput("")
                                    }
                                }} className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500">
                                    Add
                                </button>
                            </div>
                            {precautions.length > 0 && (
                                <ul className="mt-3 space-y-1">
                                    {precautions.map((p, i) => (
                                        <li key={i} className="flex items-center justify-between rounded-md bg-gray-50 dark:bg-white/5 px-3 py-2 text-sm text-gray-800 dark:text-gray-200">
                                            {p}
                                            <button type="button" onClick={() => form.setValue("precautions", precautions.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700 ml-3">
                                                <Icons.close className="w-3.5 h-3.5" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Variants */}
                        <div className="border-b border-gray-900/10 dark:border-white/10 pb-12">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Pack Sizes / Variants</h2>
                                    <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">e.g. 100 Chicks, 500 Chicks, 1000 Chicks</p>
                                </div>
                                <button type="button" onClick={() => appendVariant({ name: "", sku: "", sale_price: 0, was_price: 0, stock_level: 0 })}
                                    className="inline-flex items-center rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400">
                                    <Icons.add className="w-3.5 h-3.5 mr-1" />Add Variant
                                </button>
                            </div>
                            {variantFields.length > 0 && (
                                <div className="mt-4 space-y-3">
                                    {variantFields.map((field, index) => (
                                        <div key={field.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-5 gap-3">
                                                <div className="sm:col-span-2">
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                                    <Input placeholder="e.g. 100 Chicks" className="text-sm" {...form.register(`variants.${index}.name`)} />
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
                                            <button type="button" onClick={() => removeVariant(index)} className="mt-4 text-red-500 hover:text-red-700 dark:text-red-400">
                                                <Icons.trash className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <ProductPricingSection />

                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button type="button" onClick={() => router.push("/dashboard/farmnport/livestock-poultry")}
                            className="text-sm/6 font-semibold text-gray-900 dark:text-white">Cancel</button>
                        <button type="submit" disabled={isPending}
                            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-400">
                            {isPending && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}Save
                        </button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
