"use client"

import { useEffect } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useRouter, useParams } from "next/navigation"

import { queryMenuItemComponent, updateMenuItemComponent } from "@/lib/query"
import { MenuItemComponent } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { toast } from "@/components/ui/use-toast"
import { handleApiError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import * as z from "zod"

const EditFormSchema = z.object({
    name: z.string().min(1, "Name is required").max(120),
})

type EditFormModel = z.infer<typeof EditFormSchema>

export default function EditMenuItemComponentPage() {
    const router = useRouter()
    const params = useParams()
    const componentId = params.slug as string

    const { data, isLoading, isError } = useQuery({
        queryKey: ["menu-item-component", componentId],
        queryFn: () => queryMenuItemComponent(componentId),
        refetchOnWindowFocus: false,
    })

    const component = data?.data as MenuItemComponent

    const form = useForm<EditFormModel>({
        defaultValues: {
            name: "",
        },
        resolver: zodResolver(EditFormSchema),
    })

    useEffect(() => {
        if (component) {
            form.reset({
                name: component.name || "",
            })
        }
    }, [component, form])

    const { mutate, isPending } = useMutation({
        mutationFn: updateMenuItemComponent,
        onSuccess: () => {
            toast({
                description: "Component updated successfully",
            })
            router.push("/dashboard/restaurants/menu-item-components")
        },
        onError: (error) => {
            handleApiError(error, {
                context: "component update"
            })
        },
    })

    async function onSubmit(data: EditFormModel) {
        mutate({
            id: componentId,
            ...data,
        })
    }

    if (isLoading) {
        return (
            <Placeholder>
                <Placeholder.Title>Loading Component</Placeholder.Title>
            </Placeholder>
        )
    }

    if (isError) {
        return (
            <Placeholder>
                <Placeholder.Icon name="close" />
                <Placeholder.Title>Error Loading Component</Placeholder.Title>
            </Placeholder>
        )
    }

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Edit Component
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Update menu item component details.
                    </p>
                </div>
                <Link
                    href="/dashboard/restaurants/menu-item-components"
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
                                Component Information
                            </h2>

                            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-4 px-1">
                                    <label
                                        htmlFor="name"
                                        className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                    >
                                        Component Name
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
                                                            placeholder="Enter component name"
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

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/restaurants/menu-item-components")}
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
                            Update
                        </button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
