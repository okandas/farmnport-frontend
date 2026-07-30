"use client"

import Link from "next/link"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

import { adminCreateResourceTopic } from "@/lib/query"
import { buttonVariants } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { handleApiError, handleFormErrors } from "@/lib/error-handler"
import { cn } from "@/lib/utilities"
import { Icons } from "@/components/icons/lucide"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const inputClass = "block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500"

interface TopicFormValues {
    title: string
    slug: string
    description: string
    cover_image: string
    status: string
    order: number
}

function slugify(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

export default function NewTopicPage() {
    const router = useRouter()

    const form = useForm<TopicFormValues>({
        defaultValues: {
            title: "",
            slug: "",
            description: "",
            cover_image: "",
            status: "draft",
            order: 0,
        },
    })

    const { mutate, isPending } = useMutation({
        mutationFn: (data: TopicFormValues) => {
            return adminCreateResourceTopic({
                title: data.title,
                slug: data.slug,
                description: data.description || undefined,
                cover_image: data.cover_image || undefined,
                status: data.status,
                order: Number(data.order),
            })
        },
        onSuccess: () => {
            toast({ description: "Topic created" })
            router.push("/dashboard/farmnport/resources")
        },
        onError: (error) => handleApiError(error, { context: "create topic" }),
    })

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">New Topic</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Create a new resource topic.</p>
                </div>
                <Link href="/dashboard/farmnport/resources" className={cn(buttonVariants({ variant: "ghost" }))}>
                    <Icons.close className="w-4 h-4 mr-2" />Close
                </Link>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => mutate(data), (errors) => handleFormErrors(errors))}>
                    <div className="space-y-12">
                        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
                            <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
                                <div>
                                    <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Topic Details</h2>
                                    <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Title, slug, description, and display order.</p>
                                </div>
                                <div className="md:col-span-2">
                                    <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">

                                        <div className="sm:col-span-4">
                                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Title</label>
                                            <div className="mt-2">
                                                <FormField control={form.control} name="title" render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="e.g. Crop Management"
                                                                className={inputClass}
                                                                {...field}
                                                                onChange={(e) => {
                                                                    field.onChange(e)
                                                                    form.setValue("slug", slugify(e.target.value))
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-4">
                                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Slug</label>
                                            <div className="mt-2">
                                                <FormField control={form.control} name="slug" render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="e.g. crop-management" className={inputClass} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-6">
                                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                                            <div className="mt-2">
                                                <FormField control={form.control} name="description" render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Textarea placeholder="Short description of this topic" className={inputClass} rows={3} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-4">
                                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Cover Image URL <span className="text-gray-400 font-normal">(optional)</span></label>
                                            <div className="mt-2">
                                                <FormField control={form.control} name="cover_image" render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="https://..." className={inputClass} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Status</label>
                                            <div className="mt-2">
                                                <FormField control={form.control} name="status" render={({ field }) => (
                                                    <FormItem>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="draft">Draft</SelectItem>
                                                                <SelectItem value="published">Published</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Order</label>
                                            <div className="mt-2">
                                                <FormField control={form.control} name="order" render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input type="number" min="0" placeholder="0" className={inputClass} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/farmnport/resources")}
                            className="text-sm/6 font-semibold text-gray-900 dark:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isPending && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}
                            Create Topic
                        </button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
