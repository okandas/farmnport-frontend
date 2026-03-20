"use client"

import { use } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

import { updateFeedProduct, queryFeedProduct, queryBrands, queryFeedCategories } from "@/lib/query"
import { Brand, FeedCategory, FeedProduct } from "@/lib/schemas"
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

const EditFeedProductSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Name is required"),
    brand_id: z.string().min(1, "Brand is required"),
    feed_category_id: z.string().min(1, "Feed category is required"),
    animal: z.string().min(1, "Animal type is required"),
    phase: z.string().min(1, "Phase is required"),
    form: z.string().min(1, "Form is required"),
    description: z.string().optional().default(""),
    images: z.array(z.any()).default([]),
    active_ingredients: z.array(z.any()).default([]),
    stock_level: z.coerce.number().int().nonnegative().default(0),
    available_for_sale: z.boolean().default(false),
    show_price: z.boolean().default(true),
    sale_price: z.coerce.number().nonnegative().default(0),
    was_price: z.coerce.number().nonnegative().default(0),
})

type EditFeedProductModel = z.infer<typeof EditFeedProductSchema>

export default function EditFeedProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const router = useRouter()
    const { slug } = use(params)
    const productId = slug

    const { data: productData, isLoading } = useQuery({
        queryKey: ["feed-product", productId],
        queryFn: () => queryFeedProduct(productId),
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

    const product = productData?.data as FeedProduct
    const brands = brandsData?.data?.data as Brand[] || []
    const categories = categoriesData?.data?.data as FeedCategory[] || []

    const form = useForm<EditFeedProductModel>({
        defaultValues: {
            id: product?.id || "",
            name: product?.name || "",
            brand_id: product?.brand_id || "",
            feed_category_id: product?.feed_category_id || "",
            animal: product?.animal || "",
            phase: product?.phase || "",
            form: product?.form || "",
            description: product?.description || "",
            images: product?.images || [],
            active_ingredients: product?.active_ingredients || [],
            stock_level: product?.stock_level ?? 0,
            available_for_sale: product?.available_for_sale ?? false,
            show_price: product?.show_price ?? true,
            sale_price: product?.sale_price ?? 0,
            was_price: product?.was_price ?? 0,
        },
        values: product ? {
            id: product.id,
            name: product.name,
            brand_id: product.brand_id,
            feed_category_id: product.feed_category_id,
            animal: product.animal,
            phase: product.phase,
            form: product.form,
            description: product.description || "",
            images: product.images || [],
            active_ingredients: product.active_ingredients || [],
            stock_level: product.stock_level ?? 0,
            available_for_sale: product.available_for_sale ?? false,
            show_price: product.show_price ?? true,
            sale_price: product.sale_price ?? 0,
            was_price: product.was_price ?? 0,
        } : undefined,
        resolver: zodResolver(EditFeedProductSchema),
    })

    const { mutate, isPending } = useMutation({
        mutationFn: updateFeedProduct,
        onSuccess: () => {
            toast({
                description: "Feed product updated successfully",
            })
            router.push("/dashboard/feed-products")
        },
        onError: (error) => {
            handleApiError(error, {
                context: "feed product update"
            })
        },
    })

    async function onSubmit(data: EditFeedProductModel) {
        mutate(data)
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Icons.spinner className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    if (!product) {
        return (
            <div className="text-center py-12">
                <p className="text-sm text-red-600 dark:text-red-400">
                    Feed product not found.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Edit Feed Product
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Update feed product information.
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

                                <div className="px-1">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                        Current Slug
                                    </label>
                                    <div className="mt-2">
                                        <div className="block w-full rounded-md bg-gray-50 px-3 py-1.5 text-base text-gray-500 outline outline-1 outline-gray-300 sm:text-sm/6 dark:bg-gray-900 dark:text-gray-400 dark:outline-white/10">
                                            {product.slug}
                                        </div>
                                    </div>
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
