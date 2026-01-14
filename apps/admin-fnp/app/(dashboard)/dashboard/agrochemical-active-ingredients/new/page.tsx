"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

import { addAgroChemicalActiveIngredient } from "@/lib/query"
import { FormAgroChemicalActiveIngredientSchema, FormAgroChemicalActiveIngredientModel } from "@/lib/schemas"
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

export default function NewAgroChemicalActiveIngredientPage() {
    const router = useRouter()

    const form = useForm<FormAgroChemicalActiveIngredientModel>({
        defaultValues: {
            id: "",
            name: "",
            short_description: "",
            description: "",
        },
        resolver: zodResolver(FormAgroChemicalActiveIngredientSchema),
    })

    const { mutate, isPending } = useMutation({
        mutationFn: addAgroChemicalActiveIngredient,
        onSuccess: () => {
            toast({
                description: "Active ingredient added successfully",
            })
            router.push("/dashboard/agrochemical-active-ingredients")
        },
        onError: (error) => {
            handleApiError(error, {
                context: "active ingredient creation"
            })
        },
    })

    async function onSubmit(data: FormAgroChemicalActiveIngredientModel) {
        mutate(data)
    }

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Add AgroChemical Active Ingredient
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Create a new active ingredient for agrochemical products.
                    </p>
                </div>
                <Link
                    href="/dashboard/agrochemical-active-ingredients"
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
                                Active Ingredient Information
                            </h2>
                            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
                                Active ingredients are the chemical compounds that provide the primary effect in agrochemical products.
                            </p>

                            <div className="mt-10 space-y-8">
                                <div className="px-1">
                                    <label
                                        htmlFor="name"
                                        className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                    >
                                        Ingredient Name
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
                                                            placeholder="e.g., Glyphosate, Imidacloprid, Mancozeb"
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
                                        Enter the name of the active ingredient. The URL-friendly slug will be generated automatically.
                                    </p>
                                </div>

                                <div className="px-1">
                                    <label
                                        htmlFor="short_description"
                                        className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                    >
                                        Short Description
                                    </label>
                                    <div className="mt-2">
                                        <FormField
                                            control={form.control}
                                            name="short_description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            id="short_description"
                                                            placeholder="e.g., Non-selective herbicide"
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
                                        Brief description for SEO and metadata (max 100 characters).
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
                                                            placeholder="Describe the active ingredient, its mode of action, and common uses"
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
                                        Provide a brief description of this active ingredient (max 500 characters).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/agrochemical-active-ingredients")}
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
