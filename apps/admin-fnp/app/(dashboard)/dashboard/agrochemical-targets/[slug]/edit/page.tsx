"use client"

import { use } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

import { updateAgroChemicalTarget, queryAgroChemicalTarget } from "@/lib/query"
import { FormAgroChemicalTargetSchema, FormAgroChemicalTargetModel, AgroChemicalTarget } from "@/lib/schemas"
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

export default function EditAgroChemicalTargetPage({ params }: { params: Promise<{ slug: string }> }) {
    const router = useRouter()
    const { slug } = use(params)
    const targetId = slug

    const { data: targetData, isLoading } = useQuery({
        queryKey: ["agrochemical-target", targetId],
        queryFn: () => queryAgroChemicalTarget(targetId),
    })

    const target = targetData?.data as AgroChemicalTarget

    const form = useForm<FormAgroChemicalTargetModel>({
        defaultValues: {
            id: target?.id || "",
            name: target?.name || "",
            scientific_name: target?.scientific_name || "",
            remark: target?.remark || "",
        },
        values: target ? {
            id: target.id,
            name: target.name,
            scientific_name: target.scientific_name,
            remark: target.remark,
        } : undefined,
        resolver: zodResolver(FormAgroChemicalTargetSchema),
    })

    const { mutate, isPending } = useMutation({
        mutationFn: updateAgroChemicalTarget,
        onSuccess: () => {
            toast({
                description: "Target updated successfully",
            })
            router.push("/dashboard/agrochemical-targets")
        },
        onError: (error) => {
            handleApiError(error, {
                context: "target update"
            })
        },
    })

    async function onSubmit(data: FormAgroChemicalTargetModel) {
        mutate(data)
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-12">
                <Icons.spinner className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    if (!target) {
        return (
            <div className="text-center py-12">
                <p className="text-sm text-red-600 dark:text-red-400">
                    Target not found.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Edit AgroChemical Target
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Update the target information.
                    </p>
                </div>
                <Link
                    href="/dashboard/agrochemical-targets"
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
                                Target Information
                            </h2>
                            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
                                Targets are pests, diseases, or organisms that agrochemical products are designed to control.
                            </p>

                            <div className="mt-10 space-y-8">
                                <div className="px-1">
                                    <label
                                        htmlFor="name"
                                        className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                    >
                                        Target Name
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
                                                            placeholder="e.g., Aphids, Whiteflies, Bolworm"
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
                                        Enter the common English name of the pest or disease. The URL-friendly slug will be updated automatically.
                                    </p>
                                </div>

                                <div className="px-1">
                                    <label
                                        htmlFor="scientific_name"
                                        className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                    >
                                        Scientific Name (Optional)
                                    </label>
                                    <div className="mt-2">
                                        <FormField
                                            control={form.control}
                                            name="scientific_name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            id="scientific_name"
                                                            placeholder="e.g., Aphis gossypii, Helicoverpa armigera"
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
                                        Latin scientific name of the pest or disease (if applicable).
                                    </p>
                                </div>

                                <div className="px-1">
                                    <label
                                        htmlFor="remark"
                                        className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                    >
                                        Remarks (Optional)
                                    </label>
                                    <div className="mt-2">
                                        <FormField
                                            control={form.control}
                                            name="remark"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Textarea
                                                            id="remark"
                                                            placeholder="e.g., larvae & adult, including subspecies"
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
                                    <p className="mt-3 text-sm/6 text-gray-600 dark:text-gray-400">
                                        Additional notes about the target (e.g., specific life stages, variants).
                                    </p>
                                </div>

                                <div className="px-1">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                        Current Slug
                                    </label>
                                    <div className="mt-2">
                                        <div className="block w-full rounded-md bg-gray-50 px-3 py-1.5 text-base text-gray-500 outline outline-1 outline-gray-300 sm:text-sm/6 dark:bg-gray-900 dark:text-gray-400 dark:outline-white/10">
                                            {target.slug}
                                        </div>
                                    </div>
                                    <p className="mt-3 text-sm/6 text-gray-600 dark:text-gray-400">
                                        This is the URL-friendly version of the target name.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pb-12 flex items-center justify-end gap-x-6">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/agrochemical-targets")}
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
