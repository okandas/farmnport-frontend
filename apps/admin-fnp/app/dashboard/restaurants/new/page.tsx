"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

import { addRestaurant, queryCuisineCategories } from "@/lib/query"
import { FormRestaurantSchema, FormRestaurantModel, CuisineCategory } from "@/lib/schemas"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function NewRestaurantPage() {
    const router = useRouter()
    const [selectedCuisines, setSelectedCuisines] = useState<CuisineCategory[]>([])
    const [cuisineError, setCuisineError] = useState("")

    const { data: cuisineCategoriesData, isLoading: isLoadingCuisines } = useQuery({
        queryKey: ["cuisine-categories-for-select"],
        queryFn: () => queryCuisineCategories({ limit: 100 }),
        refetchOnWindowFocus: false,
    })

    const cuisineCategories = (cuisineCategoriesData?.data?.data as CuisineCategory[]) || []

    function handleCuisineToggle(cat: CuisineCategory) {
        setSelectedCuisines((prev) => {
            const exists = prev.find((c) => c.id === cat.id)
            if (exists) {
                return prev.filter((c) => c.id !== cat.id)
            }
            return [...prev, cat]
        })
        setCuisineError("")
    }

    const form = useForm<FormRestaurantModel>({
        defaultValues: {
            name: "",
            status: "active",
        },
        resolver: zodResolver(FormRestaurantSchema),
    })

    const { mutate, isPending } = useMutation({
        mutationFn: addRestaurant,
        onSuccess: () => {
            toast({
                description: "Restaurant added successfully",
            })
            router.push("/dashboard/restaurants")
        },
        onError: (error) => {
            handleApiError(error, {
                context: "restaurant creation"
            })
        },
    })

    async function onSubmit(data: FormRestaurantModel) {
        if (selectedCuisines.length === 0) {
            setCuisineError("At least one cuisine is required")
            return
        }
        mutate({
            ...data,
            cuisines: selectedCuisines.map((c) => ({
                cuisine_category_id: c.id,
                cuisine_category_name: c.name,
                cuisine_category_slug: c.slug || "",
            })),
        })
    }

    return (
        <div className="space-y-10 px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Add Restaurant
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Create a new restaurant listing.
                    </p>
                </div>
                <Link
                    href="/dashboard/restaurants"
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
                                Restaurant Information
                            </h2>
                            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
                                Basic details about the restaurant chain.
                            </p>

                            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-4 px-1">
                                    <label
                                        htmlFor="name"
                                        className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                    >
                                        Restaurant Name
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
                                                            placeholder="Enter restaurant name"
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

                                <div className="sm:col-span-4 px-1">
                                    <label
                                        htmlFor="status"
                                        className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                    >
                                        Status
                                    </label>
                                    <div className="mt-2">
                                        <FormField
                                            control={form.control}
                                            name="status"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select status" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="active">Active</SelectItem>
                                                            <SelectItem value="inactive">Inactive</SelectItem>
                                                            <SelectItem value="closed">Closed</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Cuisine Categories */}
                        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
                            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                                Cuisine Categories
                            </h2>
                            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
                                Select the cuisine types this restaurant serves. At least one is required.
                            </p>

                            {isLoadingCuisines ? (
                                <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                                    <Icons.spinner className="w-4 h-4 animate-spin" />
                                    Loading cuisines...
                                </div>
                            ) : (
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {cuisineCategories.map((cat) => {
                                        const isSelected = selectedCuisines.some((c) => c.id === cat.id)
                                        return (
                                            <button
                                                key={cat.id}
                                                type="button"
                                                onClick={() => handleCuisineToggle(cat)}
                                                className={cn(
                                                    "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                                                    isSelected
                                                        ? "bg-indigo-600 text-white hover:bg-indigo-500"
                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20"
                                                )}
                                            >
                                                {cat.name}
                                            </button>
                                        )
                                    })}
                                </div>
                            )}

                            {cuisineError && (
                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{cuisineError}</p>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/restaurants")}
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
