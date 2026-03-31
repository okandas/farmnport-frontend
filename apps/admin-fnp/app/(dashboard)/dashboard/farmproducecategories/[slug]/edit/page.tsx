"use client"

import { use } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

import { updateFarmProduceCategory, queryFarmProduceCategory, queryFarmProduceByCategory } from "@/lib/query"
import { FormFarmProduceCategorySchema, FormFarmProduceCategoryModel, FarmProduceCategory, FarmProduce } from "@/lib/schemas"
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

export default function EditFarmProduceCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const router = useRouter()
    const { slug } = use(params)
    const categoryId = slug

    const { data: categoryData, isLoading } = useQuery({
        queryKey: ["farm-produce-category", categoryId],
        queryFn: () => queryFarmProduceCategory(categoryId),
    })

    const category = categoryData?.data as FarmProduceCategory

    // Fetch related farm produce items
    const { data: produceData, isLoading: isLoadingProduce } = useQuery({
        queryKey: ["farm-produce-by-category", category?.slug],
        queryFn: () => queryFarmProduceByCategory(category.slug),
        enabled: !!category?.slug,
    })

    const produceItems = produceData?.data?.data as FarmProduce[] || []
    const produceTotal = produceData?.data?.total as number || 0

    const form = useForm<FormFarmProduceCategoryModel>({
        defaultValues: {
            name: category?.name || "",
            description: category?.description || "",
        },
        values: category ? {
            name: category.name,
            description: category.description,
        } : undefined,
        resolver: zodResolver(FormFarmProduceCategorySchema),
    })

    const { mutate, isPending } = useMutation({
        mutationFn: (data: FormFarmProduceCategoryModel) =>
            updateFarmProduceCategory({ slug: category.slug, name: data.name, description: data.description }),
        onSuccess: () => {
            toast({
                description: "Category updated successfully",
            })
            router.push("/dashboard/farmproducecategories")
        },
        onError: (error) => {
            handleApiError(error, {
                context: "category update"
            })
        },
    })

    async function onSubmit(data: FormFarmProduceCategoryModel) {
        mutate(data)
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Icons.spinner className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    if (!category) {
        return (
            <div className="text-center py-12">
                <p className="text-sm text-red-600 dark:text-red-400">
                    Category not found.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Edit Farm Produce Category
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Update the category information.
                    </p>
                </div>
                <Link
                    href="/dashboard/farmproducecategories"
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
                                Category Information
                            </h2>
                            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
                                Categories group related farm produce items (e.g., Cucurbits, Solanaceae, Brassicas).
                            </p>

                            <div className="mt-10 space-y-8">
                                <div className="px-1">
                                    <label
                                        htmlFor="name"
                                        className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                    >
                                        Category Name
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
                                                            placeholder="e.g., Cucurbits, Solanaceae, Brassicas"
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
                                        Enter the name of the category. The URL-friendly slug will be updated automatically.
                                    </p>
                                </div>

                                <div className="px-1">
                                    <label
                                        htmlFor="description"
                                        className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                    >
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
                                                            placeholder="Describe the category and what types of produce it includes"
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
                                    <p className="mt-3 text-sm/6 text-gray-600 dark:text-gray-400">
                                        Provide a brief description of this category (max 500 characters).
                                    </p>
                                </div>

                                <div className="px-1">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                        Current Slug
                                    </label>
                                    <div className="mt-2">
                                        <div className="block w-full rounded-md bg-gray-50 px-3 py-1.5 text-base text-gray-500 outline outline-1 outline-gray-300 sm:text-sm/6 dark:bg-gray-900 dark:text-gray-400 dark:outline-white/10">
                                            {category.slug}
                                        </div>
                                    </div>
                                    <p className="mt-3 text-sm/6 text-gray-600 dark:text-gray-400">
                                        This is the URL-friendly version of the category name.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/farmproducecategories")}
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

            {/* Related Farm Produce Items */}
            <div className="border-t border-gray-900/10 pt-10 dark:border-white/10">
                <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                        Items in this Category
                    </h2>
                    {produceTotal > 0 && (
                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                            {produceTotal} {produceTotal === 1 ? "item" : "items"}
                        </span>
                    )}
                </div>

                {isLoadingProduce ? (
                    <div className="flex justify-center py-8">
                        <Icons.spinner className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                ) : produceItems.length > 0 ? (
                    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-white/10">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
                            <thead className="bg-gray-50 dark:bg-white/5">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        Slug
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                        Description
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                                {produceItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/5">
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                            {item.name}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {item.slug}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                            {item.description}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 rounded-lg p-4 border border-gray-200 dark:border-white/10">
                        No farm produce items linked to this category yet.
                    </p>
                )}
            </div>
        </div>
    )
}
