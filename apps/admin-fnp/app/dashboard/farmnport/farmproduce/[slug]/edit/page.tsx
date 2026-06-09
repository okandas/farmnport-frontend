"use client"

import { use } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

import { updateFarmProduce, queryFarmProduceBySlug, queryFarmProduceCategories } from "@/lib/query"
import { FormFarmProduceSchema, FormFarmProduceModel } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { toast } from "@/components/ui/use-toast"
import { handleApiError } from "@/lib/error-handler"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SearchSelect } from "@/components/ui/search-select"

const inputClass = "block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"

export default function EditFarmProducePage({ params }: { params: Promise<{ slug: string }> }) {
    const router = useRouter()
    const { slug } = use(params)

    const { data, isLoading } = useQuery({
        queryKey: ["farm-produce", slug],
        queryFn: () => queryFarmProduceBySlug(slug),
    })

    const produce = data?.data

    const form = useForm<FormFarmProduceModel>({
        defaultValues: { name: "", description: "", category_id: "", category_slug: "", lots_enabled: false },
        values: produce ? {
            name: produce.name,
            description: produce.description ?? "",
            category_id: produce.category_id,
            category_slug: produce.category_slug,
            lots_enabled: produce.lots_enabled ?? false,
        } : undefined,
        resolver: zodResolver(FormFarmProduceSchema),
    })

    const { mutate, isPending } = useMutation({
        mutationFn: (d: FormFarmProduceModel) => updateFarmProduce({ slug, ...d }),
        onSuccess: () => {
            toast({ description: "Farm produce updated successfully" })
            router.push("/dashboard/farmnport/farmproduce")
        },
        onError: (error) => handleApiError(error, { context: "farm produce update" }),
    })

    if (isLoading) return <div className="flex justify-center py-12"><Icons.spinner className="w-8 h-8 animate-spin text-gray-400" /></div>
    if (!produce) return <p className="text-center py-12 text-sm text-red-600">Farm produce not found.</p>

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Edit Farm Produce</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Update farm produce details.</p>
                </div>
                <Link href="/dashboard/farmnport/farmproduce" className={cn(buttonVariants({ variant: "ghost" }))}>
                    <Icons.close className="w-4 h-4 mr-2" />Close
                </Link>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit((d) => mutate(d))}>
                    <div className="space-y-12">
                        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
                            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Produce Information</h2>
                            <div className="mt-10 space-y-8">

                                <div className="px-1">
                                    <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900 dark:text-white">Name</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="name" render={({ field }) => (
                                            <FormItem>
                                                <FormControl><Input id="name" className={inputClass} {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>

                                <div className="px-1">
                                    <label htmlFor="description" className="block text-sm/6 font-medium text-gray-900 dark:text-white">Description</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="description" render={({ field }) => (
                                            <FormItem>
                                                <FormControl><Textarea id="description" rows={3} className={inputClass} {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>

                                <div className="px-1">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Category</label>
                                    <div className="mt-2">
                                        <FormField control={form.control} name="category_id" render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <SearchSelect
                                                        queryKey="farm-produce-categories-select"
                                                        queryFn={(params) => queryFarmProduceCategories({ p: params.p, search: params.search })}
                                                        getItems={(page) => page?.data?.data ?? []}
                                                        value={field.value ?? ""}
                                                        onValueChange={field.onChange}
                                                        onItemSelect={(cat) => form.setValue("category_slug", cat.slug)}
                                                        getLabel={(cat) => cat.name}
                                                        getValue={(cat) => cat.id}
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

                                <div className="px-1">
                                    <FormField control={form.control} name="lots_enabled" render={({ field }) => (
                                        <FormItem>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <FormControl>
                                                    <input
                                                        type="checkbox"
                                                        checked={field.value}
                                                        onChange={field.onChange}
                                                        className="h-4 w-4 rounded border-gray-300 accent-indigo-600"
                                                    />
                                                </FormControl>
                                                <div>
                                                    <p className="text-sm/6 font-medium text-gray-900 dark:text-white">Enable Lots</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">Allow users to post and request lots for this produce.</p>
                                                </div>
                                            </label>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>

                                <div className="px-1">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Current Slug</label>
                                    <div className="mt-2 block w-full rounded-md bg-gray-50 px-3 py-1.5 text-sm text-gray-500 outline outline-1 outline-gray-300 dark:bg-gray-900 dark:text-gray-400 dark:outline-white/10">
                                        {produce.slug}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button type="button" onClick={() => router.push("/dashboard/farmnport/farmproduce")} className="text-sm/6 font-semibold text-gray-900 dark:text-white">Cancel</button>
                        <button type="submit" disabled={isPending} className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isPending && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}Save
                        </button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
