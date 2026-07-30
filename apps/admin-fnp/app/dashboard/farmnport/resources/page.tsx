"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"

import { adminListResourceTopics, adminListResourceArticles } from "@/lib/query"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utilities"

export default function ResourcesPage() {
    const { data: topicsData, isLoading: topicsLoading } = useQuery({
        queryKey: ["admin-resource-topics"],
        queryFn: () => adminListResourceTopics().then(r => r.data),
    })

    const { data: articlesData, isLoading: articlesLoading } = useQuery({
        queryKey: ["admin-resource-articles"],
        queryFn: () => adminListResourceArticles().then(r => r.data),
    })

    const topics = topicsData?.topics ?? []
    const articles = articlesData?.articles ?? []

    return (
        <div className="space-y-10">
            {/* Topics */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Resource Topics</h2>
                    <Link href="/dashboard/farmnport/resources/topics/new" className={cn(buttonVariants({ variant: "default" }))}>
                        New Topic
                    </Link>
                </div>
                {topicsLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-md border">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
                            <thead className="bg-gray-50 dark:bg-white/5">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                                {topics.map((t: any) => (
                                    <tr key={t.id}>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{t.title}</td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{t.slug}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs font-medium", t.status === "published" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400")}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{t.order}</td>
                                        <td className="px-4 py-3 text-sm text-right">
                                            <Link href={`/dashboard/farmnport/resources/topics/${t.id}`} className="text-primary hover:underline">Edit</Link>
                                        </td>
                                    </tr>
                                ))}
                                {topics.length === 0 && (
                                    <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">No topics yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Articles */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Resource Articles</h2>
                    <Link href="/dashboard/farmnport/resources/articles/new" className={cn(buttonVariants({ variant: "default" }))}>
                        New Article
                    </Link>
                </div>
                {articlesLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-md border">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
                            <thead className="bg-gray-50 dark:bg-white/5">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Topic</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                                {articles.map((a: any) => (
                                    <tr key={a.id}>
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{a.title}</td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{a.slug}</td>
                                        <td className="px-4 py-3 text-sm text-muted-foreground">{a.topic_title ?? a.topic_id}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs font-medium", a.status === "published" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400")}>
                                                {a.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-right">
                                            <Link href={`/dashboard/farmnport/resources/articles/${a.id}`} className="text-primary hover:underline">Edit</Link>
                                        </td>
                                    </tr>
                                ))}
                                {articles.length === 0 && (
                                    <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">No articles yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
