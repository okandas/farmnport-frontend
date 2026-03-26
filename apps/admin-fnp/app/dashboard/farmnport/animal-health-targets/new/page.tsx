"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

import { addAnimalHealthTarget } from "@/lib/query"
import { FormAnimalHealthTargetSchema, FormAnimalHealthTargetModel } from "@/lib/schemas"
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

export default function NewAnimalHealthTargetPage() {
    const router = useRouter()

    const form = useForm<FormAnimalHealthTargetModel>({
        defaultValues: {
            id: "",
            name: "",
            scientific_name: "",
            description: "",
            damage_type: "",
            remark: "",
        },
        resolver: zodResolver(FormAnimalHealthTargetSchema),
    })

    const { mutate, isPending } = useMutation({
        mutationFn: addAnimalHealthTarget,
        onSuccess: () => {
            toast({
                description: "Target added successfully",
            })
            router.push("/dashboard/farmnport/animal-health-targets")
        },
        onError: (error) => {
            handleApiError(error, {
                context: "target creation"
            })
        },
    })

    async function onSubmit(data: FormAnimalHealthTargetModel) {
        mutate(data)
    }

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Add Animal Health Target
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Create a new disease or condition target for animal health products.
                    </p>
                </div>
                <Link
                    href="/dashboard/farmnport/animal-health-targets"
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
                                Targets are diseases, conditions, or pathogens that animal health products are designed to treat or prevent.
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
                                                            placeholder="e.g., Newcastle Disease, Coccidiosis, Gumboro"
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
                                        Enter the common name of the disease or condition. The URL-friendly slug will be generated automatically.
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
                                                            placeholder="e.g., Eimeria tenella, Paramyxovirus type 1"
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
                                        Scientific name of the pathogen or disease (if applicable).
                                    </p>
                                </div>

                                <div className="px-1">
                                    <label
                                        htmlFor="description"
                                        className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                    >
                                        Description (Optional)
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
                                                            placeholder="e.g., A highly contagious viral disease affecting poultry respiratory and nervous systems"
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
                                        User-friendly explanation of the disease or condition.
                                    </p>
                                </div>

                                <div className="px-1">
                                    <label
                                        htmlFor="damage_type"
                                        className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                    >
                                        Damage Type (Optional)
                                    </label>
                                    <div className="mt-2">
                                        <FormField
                                            control={form.control}
                                            name="damage_type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Textarea
                                                            id="damage_type"
                                                            placeholder="e.g., Causes respiratory distress, drop in egg production, high mortality in unvaccinated flocks"
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
                                        SEO-optimized description of symptoms and effects on animals.
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
                                                            placeholder="e.g., Common in broilers aged 3-6 weeks, notifiable disease"
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
                                        Additional notes about the target (e.g., age groups affected, regulatory status).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pb-12 flex items-center justify-end gap-x-6">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/farmnport/animal-health-targets")}
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
