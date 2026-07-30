"use client"

import Link from "next/link"
import { useRef } from "react"
import { useParams } from "next/navigation"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { adminGetResourceArticle, adminUpdateResourceArticle, adminListResourceTopics } from "@/lib/query"
import { buttonVariants } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { handleApiError, handleFormErrors } from "@/lib/error-handler"
import { cn } from "@/lib/utilities"
import { Icons } from "@/components/icons/lucide"
import { EditorJSComponent } from "@/components/structures/controls/editor-js"
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

interface ArticleFormValues {
    title: string
    slug: string
    description: string
    cover_image: string
    topic_id: string
    tags: string
    status: string
}

export default function EditArticlePage() {
    const { id } = useParams<{ id: string }>()

    const { data, isLoading } = useQuery({
        queryKey: ["admin-resource-article", id],
        queryFn: () => adminGetResourceArticle(id).then(r => r.data),
        enabled: !!id,
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    const article = data?.article
    if (!article) return null

    return (
        <EditArticleForm
            articleId={id}
            defaultValues={{
                title: article.title ?? "",
                slug: article.slug ?? "",
                description: article.description ?? "",
                cover_image: article.cover_image ?? "",
                topic_id: article.topic_id ?? "",
                tags: (article.tags ?? []).join(", "),
                status: article.status ?? "draft",
            }}
            initialContent={article.content}
        />
    )
}

function EditArticleForm({ articleId, defaultValues, initialContent }: { articleId: string; defaultValues: ArticleFormValues; initialContent?: any }) {
    const router = useRouter()
    const editorDataRef = useRef<any>(initialContent ?? null)

    const { data: topicsData } = useQuery({
        queryKey: ["admin-resource-topics"],
        queryFn: () => adminListResourceTopics().then(r => r.data),
    })

    const topics = topicsData?.topics ?? []

    const form = useForm<ArticleFormValues>({ defaultValues })

    const { mutate, isPending } = useMutation({
        mutationFn: (data: ArticleFormValues) => {
            return adminUpdateResourceArticle(articleId, {
                title: data.title,
                slug: data.slug,
                description: data.description || undefined,
                cover_image: data.cover_image || undefined,
                topic_id: data.topic_id || undefined,
                tags: data.tags ? data.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
                status: data.status,
                content: editorDataRef.current ?? undefined,
            })
        },
        onSuccess: () => {
            toast({ description: "Article updated" })
            router.push("/dashboard/farmnport/resources")
        },
        onError: (error) => handleApiError(error, { context: "update article" }),
    })

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Edit Article</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Update article details and content.</p>
                </div>
                <Link href="/dashboard/farmnport/resources" className={cn(buttonVariants({ variant: "ghost" }))}>
                    <Icons.close className="w-4 h-4 mr-2" />Close
                </Link>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit((data) => mutate(data), (errors) => handleFormErrors(errors))}>
                    <div className="space-y-12">

                        {/* Details */}
                        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
                            <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
                                <div>
                                    <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Article Details</h2>
                                    <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Title, topic, tags, and status.</p>
                                </div>
                                <div className="md:col-span-2">
                                    <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">

                                        <div className="sm:col-span-4">
                                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Title</label>
                                            <div className="mt-2">
                                                <FormField control={form.control} name="title" render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="e.g. How to Plant Tomatoes" className={inputClass} {...field} />
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
                                                            <Input placeholder="e.g. how-to-plant-tomatoes" className={inputClass} {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-6">
                                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Description <span className="text-gray-400 font-normal">(short summary)</span></label>
                                            <div className="mt-2">
                                                <FormField control={form.control} name="description" render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Textarea placeholder="Brief description of this article" className={inputClass} rows={2} {...field} />
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
                                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Topic</label>
                                            <div className="mt-2">
                                                <FormField control={form.control} name="topic_id" render={({ field }) => (
                                                    <FormItem>
                                                        <Select onValueChange={field.onChange} value={field.value}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Select topic" /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                {topics.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>)}
                                                            </SelectContent>
                                                        </Select>
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

                                        <div className="sm:col-span-6">
                                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Tags <span className="text-gray-400 font-normal">(comma-separated, optional)</span></label>
                                            <div className="mt-2">
                                                <FormField control={form.control} name="tags" render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="e.g. tomato, planting, guide" className={inputClass} {...field} />
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

                        {/* Content Editor */}
                        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
                            <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
                                <div>
                                    <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Content</h2>
                                    <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Edit the article body using the editor below.</p>
                                </div>
                                <div className="md:col-span-2">
                                    <EditorJSComponent
                                        initialData={initialContent}
                                        onChange={(data) => { editorDataRef.current = data }}
                                        placeholder="Start writing your article..."
                                    />
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
                            Save Changes
                        </button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
