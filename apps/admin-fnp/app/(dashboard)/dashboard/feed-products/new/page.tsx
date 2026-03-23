"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

import { addFeedProduct, queryBrands, queryFeedCategories } from "@/lib/query"
import { Brand, FeedCategory } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { toast } from "@/components/ui/use-toast"
import { handleApiError } from "@/lib/error-handler"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import * as z from "zod"

const NewFeedProductSchema = z.object({
    name: z.string().min(1, "Name is required"),
    brand_id: z.string().min(1, "Brand is required"),
    feed_category_id: z.string().min(1, "Feed category is required"),
    animal: z.string().min(1, "Animal type is required"),
    phase: z.string().min(1, "Phase is required"),
    form: z.string().min(1, "Form is required"),
    description: z.string().optional().default(""),
    sub_type: z.string().optional().default(""),
    breed_recommendations: z.string().optional().default(""),
    feeding_instructions: z.string().optional().default(""),
    management_tips: z.string().optional().default(""),
    safety_warnings: z.string().optional().default(""),
    package_size: z.string().optional().default(""),
    images: z.array(z.any()).default([]),
    active_ingredients: z.array(z.any()).default([]),
    stock_level: z.coerce.number().int().nonnegative().default(0),
    available_for_sale: z.boolean().default(false),
    show_price: z.boolean().default(true),
    sale_price: z.coerce.number().nonnegative().default(0),
    was_price: z.coerce.number().nonnegative().default(0),
})

type NewFeedProductModel = z.infer<typeof NewFeedProductSchema>

export default function NewFeedProductPage() {
    const router = useRouter()

    const form = useForm<NewFeedProductModel>({
        defaultValues: {
            name: "",
            brand_id: "",
            feed_category_id: "",
            animal: "",
            phase: "",
            form: "",
            description: "",
            sub_type: "",
            breed_recommendations: "",
            feeding_instructions: "",
            management_tips: "",
            safety_warnings: "",
            package_size: "",
            images: [],
            active_ingredients: [],
            stock_level: 0,
            available_for_sale: false,
            show_price: true,
            sale_price: 0,
            was_price: 0,
        },
        resolver: zodResolver(NewFeedProductSchema),
    })

    const { data: brandsData } = useQuery({
        queryKey: ["brands-list"],
        queryFn: () => queryBrands(),
        refetchOnWindowFocus: false,
    })

    const { data: categoriesData } = useQuery({
        queryKey: ["feed-categories-list"],
        queryFn: () => queryFeedCategories(),
        refetchOnWindowFocus: false,
    })

    const brands = brandsData?.data?.data as Brand[] || []
    const categories = categoriesData?.data?.data as FeedCategory[] || []

    const { mutate, isPending } = useMutation({
        mutationFn: addFeedProduct,
        onSuccess: () => {
            toast({
                description: "Feed product added successfully",
            })
            router.push("/dashboard/feed-products")
        },
        onError: (error) => {
            handleApiError(error, {
                context: "feed product creation"
            })
        },
    })

    async function onSubmit(data: NewFeedProductModel) {
        mutate(data)
    }

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Add Feed Product
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Create a new livestock feed product.
                    </p>
                </div>
                <Link
                    href="/dashboard/feed-products"
                    className={cn(buttonVariants({ variant: "ghost" }))}
                >
                    <Icons.close className="w-4 h-4 mr-2" />
                    Close
                </Link>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="space-y-12">
                        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
                            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                                Product Information
                            </h2>
                            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
                                Basic information about the feed product.
                            </p>

                            <div className="mt-10 space-y-8">
                                <div className="px-1">
                                    <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
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
                                                            placeholder="e.g., Fivet 3 Phase Broiler Starter Crumbs"
                                                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="px-1">
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
                                                        <select
                                                            id="brand_id"
                                                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                                            {...field}
                                                        >
                                                            <option value="">Select a brand</option>
                                                            {brands.map((brand) => (
                                                                <option key={brand.id} value={brand.id}>
                                                                    {brand.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="px-1">
                                    <label htmlFor="feed_category_id" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                        Feed Category
                                    </label>
                                    <div className="mt-2">
                                        <FormField
                                            control={form.control}
                                            name="feed_category_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <select
                                                            id="feed_category_id"
                                                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                                            {...field}
                                                        >
                                                            <option value="">Select a category</option>
                                                            {categories.map((cat) => (
                                                                <option key={cat.id} value={cat.id}>
                                                                    {cat.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="px-1">
                                    <label htmlFor="animal" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                        Animal Type
                                    </label>
                                    <div className="mt-2">
                                        <FormField
                                            control={form.control}
                                            name="animal"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            id="animal"
                                                            placeholder="e.g., Chickens (Broilers), Chickens (Layers), Cattle"
                                                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="px-1">
                                    <label htmlFor="phase" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                        Phase
                                    </label>
                                    <div className="mt-2">
                                        <FormField
                                            control={form.control}
                                            name="phase"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            id="phase"
                                                            placeholder="e.g., Starter, Grower, Finisher, Laying"
                                                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="px-1">
                                    <label htmlFor="form" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                        Form
                                    </label>
                                    <div className="mt-2">
                                        <FormField
                                            control={form.control}
                                            name="form"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            id="form"
                                                            placeholder="e.g., Pellets, Mash, Crumbs, Concentrate"
                                                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="px-1">
                                    <label htmlFor="description" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                        Description
                                    </label>
                                    <div className="mt-2">
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Textarea
                                                            id="description"
                                                            placeholder="Describe the feed product"
                                                            rows={4}
                                                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                {/* Product Details */}
                <div className="border-b border-gray-900/10 dark:border-gray-100/10 pb-12">
                    <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Product Details</h2>
                    <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Additional product information for buyers.</p>

                    <div className="mt-10 space-y-8">
                        <div className="px-1">
                            <label htmlFor="sub_type" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                Product Type
                            </label>
                            <div className="mt-2">
                                <FormField
                                    control={form.control}
                                    name="sub_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <select
                                                    id="sub_type"
                                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                                    {...field}
                                                >
                                                    <option value="">Select product type</option>
                                                    <option value="Finished Feed">Finished Feed</option>
                                                    <option value="Concentrate">Concentrate</option>
                                                    <option value="Basemix">Basemix</option>
                                                    <option value="Premix">Premix</option>
                                                </select>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="px-1">
                            <label htmlFor="package_size" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                Package Size
                            </label>
                            <div className="mt-2">
                                <FormField
                                    control={form.control}
                                    name="package_size"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    id="package_size"
                                                    placeholder="e.g., 50 kg"
                                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="px-1">
                            <label htmlFor="breed_recommendations" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                Breed Recommendations
                            </label>
                            <div className="mt-2">
                                <FormField
                                    control={form.control}
                                    name="breed_recommendations"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea
                                                    id="breed_recommendations"
                                                    placeholder="e.g., Road Runners, Turkeys, Guinea fowls, Ducklings"
                                                    rows={3}
                                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="px-1">
                            <label htmlFor="feeding_instructions" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                Feeding Instructions
                            </label>
                            <div className="mt-2">
                                <FormField
                                    control={form.control}
                                    name="feeding_instructions"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea
                                                    id="feeding_instructions"
                                                    placeholder="e.g., Feed ad lib from day 0 to day 14. Expected intake: 500g per bird."
                                                    rows={3}
                                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="px-1">
                            <label htmlFor="management_tips" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                Management Tips
                            </label>
                            <div className="mt-2">
                                <FormField
                                    control={form.control}
                                    name="management_tips"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea
                                                    id="management_tips"
                                                    placeholder="e.g., 40 chicks per sqm during brooding. Use infrared lamp ~1m from floor."
                                                    rows={3}
                                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="px-1">
                            <label htmlFor="safety_warnings" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                Safety Warnings
                            </label>
                            <div className="mt-2">
                                <FormField
                                    control={form.control}
                                    name="safety_warnings"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea
                                                    id="safety_warnings"
                                                    placeholder="e.g., Contains feed grade Urea. Must be fed strictly according to recommendations."
                                                    rows={3}
                                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pricing & Stock */}
                <div className="border-b border-gray-900/10 dark:border-gray-100/10 pb-12">
                    <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Pricing & Stock</h2>
                    <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Guide pricing and inventory information.</p>

                    <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-6">
                        <div className="sm:col-span-3 flex items-center gap-4">
                            <FormField
                                control={form.control}
                                name="show_price"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-2">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
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

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/feed-products")}
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
