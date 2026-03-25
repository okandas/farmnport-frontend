"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

import { addAnimalHealthProduct } from "@/lib/query"
import { FormAnimalHealthProductSchema, FormAnimalHealthProductModel } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { toast } from "@/components/ui/use-toast"
import { handleApiError } from "@/lib/error-handler"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function NewAnimalHealthProductPage() {
    const router = useRouter()

    const form = useForm<FormAnimalHealthProductModel>({
        defaultValues: {
            id: "",
            name: "",
            brand_id: "",
            animal_health_category_id: "",
            images: [],
            active_ingredients: [],
            dosage_rates: [],
            stock_level: 0,
            available_for_sale: false,
            show_price: true,
            sale_price: 0,
            was_price: 0,
        },
        resolver: zodResolver(FormAnimalHealthProductSchema),
    })

    const { mutate, isPending } = useMutation({
        mutationFn: addAnimalHealthProduct,
        onSuccess: () => {
            toast({
                description: "Product added successfully",
            })
            router.push("/dashboard/farmnport/animal-health-products")
        },
        onError: (error) => {
            handleApiError(error, {
                context: "product creation"
            })
        },
    })

    async function onSubmit(data: FormAnimalHealthProductModel) {
        mutate(data)
    }

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Add Animal Health Product
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Create a new animal health product.
                    </p>
                </div>
                <Link
                    href="/dashboard/farmnport/animal-health-products"
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
                                Basic information about the animal health product.
                            </p>

                            <div className="mt-10 space-y-8">
                                <div className="px-1">
                                    <label
                                        htmlFor="name"
                                        className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                    >
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
                                                            placeholder="e.g., Terramycin LA, Ivomec, Multimin"
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
                                        Enter the name of the product. The URL-friendly slug will be generated automatically.
                                    </p>
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
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/farmnport/animal-health-products")}
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
