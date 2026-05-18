"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import * as z from "zod"

import { addSeedProduct, queryBrands, queryFarmProduce } from "@/lib/query"
import { Brand } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { toast } from "@/components/ui/use-toast"
import { handleApiError } from "@/lib/error-handler"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

const inputClass = "block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"

const Schema = z.object({
    name: z.string().min(1, "Name is required"),
    type: z.string().min(1, "Type is required"),
    variety: z.string().optional().default(""),
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
    show_price: z.boolean().default(false),
    sale_price: z.coerce.number().default(0),
    was_price: z.coerce.number().default(0),
})

type FormModel = z.infer<typeof Schema>

export default function NewSeedProductPage() {
    const router = useRouter()
    const [precautionInput, setPrecautionInput] = useState("")

    const form = useForm<FormModel>({
        defaultValues: {
            name: "", type: "", variety: "", brand_id: "", seller_id: "",
            farm_produce_id: "", description: "", planting_season: "",
            days_to_maturity: "", yield_potential: "", soil_requirements: "",
            seed_treatment: "", management_tips: "",
            planting_guide: [], precautions: [], variants: [],
            stock_level: 0, available_for_sale: false, show_price: false, sale_price: 0, was_price: 0,
        },
        resolver: zodResolver(Schema),
    })

    const { data: brandsData } = useQuery({ queryKey: ["brands-list"], queryFn: () => queryBrands(), refetchOnWindowFocus: false })
    const { data: farmProduceData } = useQuery({ queryKey: ["farm-produce-list"], queryFn: () => queryFarmProduce(), refetchOnWindowFocus: false })

    const brands = brandsData?.data?.data as Brand[] || []
    const farmProduce = farmProduceData?.data?.data || []

    const { fields: guideFields, append: appendGuide, remove: removeGuide } = useFieldArray({ control: form.control, name: "planting_guide" })
    const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({ control: form.control, name: "variants" })

    const precautions = form.watch("precautions")

    const { mutate, isPending } = useMutation({
        mutationFn: addSeedProduct,
        onSuccess: () => {
            toast({ description: "Seed product added successfully" })
            router.push("/dashboard/farmnport/seed-products")
        },
        onError: (error) => handleApiError(error, { context: "seed product creation" }),
    })

    function onSubmit(data: FormModel) {
        mutate(data)
    }

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Add Seed Product</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Create a new seed or planting material guide.</p>
                </div>
                <Link href="/dashboard/farmnport/seed-products" className={cn(buttonVariants({ variant: "ghost" }))}>
                    <Icons.close className="w-4 h-4 mr-2" />Close
                </Link>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="space-y-12">

                        {/* Product Information */}
                        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
                            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Product Information</h2>
                            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Basic details about this seed product.</p>

                            <div className="mt-10 space-y-8">
                                <div className="px-1">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Product Name</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="name" render={({ field }) => (
                                            <FormItem>
                                                <FormControl><Input placeholder="e.g. Mondial Potato Seed" className={inputClass} {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>

                                <div className="px-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Type</label>
                                        <div className="mt-2">
                                            <FormField control={form.control} name="type" render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <select className={inputClass} {...field}>
                                                            <option value="">Select type</option>
                                                            <option value="seed_potato">Seed Potato</option>
                                                            <option value="tuber">Tuber</option>
                                                            <option value="maize">Maize</option>
                                                            <option value="vegetable">Vegetable</option>
                                                            <option value="pasture">Pasture</option>
                                                            <option value="other">Other</option>
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Variety</label>
                                        <div className="mt-2">
                                            <FormField control={form.control} name="variety" render={({ field }) => (
                                                <FormItem>
                                                    <FormControl><Input placeholder="e.g. Mondial, SC403, Heinz 1370" className={inputClass} {...field} /></FormControl>
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
                                            <FormItem><FormControl><Textarea placeholder="Brief overview of this seed product" rows={3} className={inputClass} {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Growing Guide */}
                        <div className="border-b border-gray-900/10 dark:border-white/10 pb-12">
                            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Growing Guide</h2>
                            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Agronomic details for the guide page.</p>

                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="px-1">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Planting Season</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="planting_season" render={({ field }) => (
                                            <FormItem><FormControl><Input placeholder="e.g. March–May / July–September" className={inputClass} {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                </div>
                                <div className="px-1">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Days to Maturity</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="days_to_maturity" render={({ field }) => (
                                            <FormItem><FormControl><Input placeholder="e.g. 90–110 days" className={inputClass} {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                </div>
                                <div className="px-1">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Yield Potential</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="yield_potential" render={({ field }) => (
                                            <FormItem><FormControl><Input placeholder="e.g. 35–45 tonnes/ha" className={inputClass} {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                </div>
                                <div className="px-1">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Seed Treatment</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="seed_treatment" render={({ field }) => (
                                            <FormItem><FormControl><Input placeholder="e.g. Certified, disease-free" className={inputClass} {...field} /></FormControl><FormMessage /></FormItem>
                                        )} />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 px-1">
                                <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Soil Requirements</label>
                                <div className="mt-2">
                                    <FormField control={form.control} name="soil_requirements" render={({ field }) => (
                                        <FormItem><FormControl><Textarea placeholder="e.g. Well-drained, pH 5.5–6.5, high organic matter" rows={3} className={inputClass} {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                            </div>

                            <div className="mt-6 px-1">
                                <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Management Tips</label>
                                <div className="mt-2">
                                    <FormField control={form.control} name="management_tips" render={({ field }) => (
                                        <FormItem><FormControl><Textarea placeholder="Key agronomic guidance for farmers" rows={3} className={inputClass} {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                            </div>
                        </div>

                        {/* Planting Guide Steps */}
                        <div className="border-b border-gray-900/10 dark:border-white/10 pb-12">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Planting Guide Steps</h2>
                                    <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Step-by-step planting instructions.</p>
                                </div>
                                <button type="button" onClick={() => appendGuide({ step: "", notes: "" })}
                                    className="inline-flex items-center rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500">
                                    <Icons.add className="w-3.5 h-3.5 mr-1" />Add Step
                                </button>
                            </div>
                            {guideFields.length > 0 && (
                                <div className="mt-4 space-y-3">
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

                        {/* Precautions */}
                        <div className="border-b border-gray-900/10 dark:border-white/10 pb-12">
                            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Precautions</h2>
                            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Important handling and storage notes.</p>
                            <div className="mt-4 flex gap-2">
                                <Input value={precautionInput} onChange={(e) => setPrecautionInput(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (precautionInput.trim()) { form.setValue("precautions", [...precautions, precautionInput.trim()]); setPrecautionInput("") } } }}
                                    placeholder="Type a precaution and press Enter" className={inputClass} />
                                <button type="button" onClick={() => { if (precautionInput.trim()) { form.setValue("precautions", [...precautions, precautionInput.trim()]); setPrecautionInput("") } }}
                                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500">Add</button>
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

                        {/* Variants */}
                        <div className="border-b border-gray-900/10 dark:border-white/10 pb-12">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Pack Sizes / Variants</h2>
                                    <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">e.g. Small Tubers – 25kg, Certified Seed – 50kg</p>
                                </div>
                                <button type="button" onClick={() => appendVariant({ name: "", sku: "", sale_price: 0, was_price: 0, stock_level: 0 })}
                                    className="inline-flex items-center rounded-md bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500">
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

                        {/* Pricing & Stock */}
                        <div className="border-b border-gray-900/10 dark:border-white/10 pb-12">
                            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Pricing & Stock</h2>
                            <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                                <div className="sm:col-span-3 flex items-center gap-4">
                                    <FormField control={form.control} name="show_price" render={({ field }) => (
                                        <FormItem className="flex items-center gap-2">
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <label className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer" onClick={() => field.onChange(!field.value)}>Show Price</label>
                                        </FormItem>
                                    )} />
                                </div>
                                <div className="sm:col-span-3 flex items-center gap-4">
                                    <FormField control={form.control} name="available_for_sale" render={({ field }) => (
                                        <FormItem className="flex items-center gap-2">
                                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                            <label className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer" onClick={() => field.onChange(!field.value)}>Available for Sale</label>
                                        </FormItem>
                                    )} />
                                </div>
                                <div className="sm:col-span-2">
                                    <FormField control={form.control} name="sale_price" render={({ field }) => (
                                        <FormItem><label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Sale Price (USD)</label><FormControl><Input type="number" step="0.01" min="0" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                                <div className="sm:col-span-2">
                                    <FormField control={form.control} name="was_price" render={({ field }) => (
                                        <FormItem><label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Was Price (USD)</label><FormControl><Input type="number" step="0.01" min="0" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                                <div className="sm:col-span-2">
                                    <FormField control={form.control} name="stock_level" render={({ field }) => (
                                        <FormItem><label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Stock Level</label><FormControl><Input type="number" min="0" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button type="button" onClick={() => router.push("/dashboard/farmnport/seed-products")} className="text-sm/6 font-semibold text-gray-900 dark:text-white">Cancel</button>
                        <button type="submit" disabled={isPending}
                            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-400">
                            {isPending && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}Save
                        </button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
