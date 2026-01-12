"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import * as z from "zod"

import { updateBrand, queryBrand } from "@/lib/query"
import { Brand } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const BrandFormSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Brand name is required").max(80, "Brand name cannot exceed 80 characters"),
})

type BrandFormData = z.infer<typeof BrandFormSchema>

export default function EditBrandPage({ params }: { params: { slug: string } }) {
    const router = useRouter()
    const brandId = params.slug

    const { data: brandData, isLoading } = useQuery({
        queryKey: ["brand", brandId],
        queryFn: () => queryBrand(brandId),
    })

    const brand = brandData?.data as Brand

    const form = useForm<BrandFormData>({
        defaultValues: {
            id: brand?.id || "",
            name: brand?.name || "",
        },
        values: brand ? {
            id: brand.id,
            name: brand.name,
        } : undefined,
        resolver: zodResolver(BrandFormSchema),
    })

    const { mutate, isPending } = useMutation({
        mutationFn: updateBrand,
        onSuccess: () => {
            toast({
                description: "Brand updated successfully",
            })
            router.push("/dashboard/brands")
        },
        onError: (error) => {
            if (isAxiosError(error)) {
                switch (error.code) {
                    case "ERR_NETWORK":
                        toast({
                            description: "There seems to be a network error.",
                            action: <ToastAction altText="Try again">Try again</ToastAction>,
                        })
                        break

                    default:
                        toast({
                            title: "Uh oh! Brand update failed.",
                            description: error.response?.data?.message || "There was a problem with your request.",
                            action: <ToastAction altText="Try again">Try again</ToastAction>,
                        })
                        break
                }
            }
        },
    })

    async function onSubmit(data: BrandFormData) {
        mutate(data)
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Icons.spinner className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    if (!brand) {
        return (
            <div className="text-center py-12">
                <p className="text-sm text-red-600 dark:text-red-400">
                    Brand not found.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Edit Brand
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Update the brand information.
                    </p>
                </div>
                <Link
                    href="/dashboard/brands"
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
                                Brand Information
                            </h2>
                            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
                                This information will be used to identify the brand in the system.
                            </p>

                            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-4">
                                    <label
                                        htmlFor="name"
                                        className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                    >
                                        Brand Name
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
                                                            placeholder="Enter brand name"
                                                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <p className="mt-3 text-sm/6 text-gray-600 dark:text-gray-400">
                                        Enter the official name of the brand. The URL-friendly slug will be updated automatically.
                                    </p>
                                </div>

                                <div className="sm:col-span-4">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                        Current Slug
                                    </label>
                                    <div className="mt-2">
                                        <div className="block w-full rounded-md bg-gray-50 px-3 py-1.5 text-base text-gray-500 outline outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6 dark:bg-gray-900 dark:text-gray-400 dark:outline-white/10">
                                            {brand.slug}
                                        </div>
                                    </div>
                                    <p className="mt-3 text-sm/6 text-gray-600 dark:text-gray-400">
                                        This is the URL-friendly version of the brand name.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/brands")}
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
