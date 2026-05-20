"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { queryBreeds, deleteBreed } from "@/lib/query"
import { Icons } from "@/components/icons/lucide"
import { toast } from "@/components/ui/use-toast"
import { handleApiError } from "@/lib/error-handler"

export default function BreedsPage() {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")
    const queryClient = useQueryClient()

    const { data, isLoading } = useQuery({
        queryKey: ["breeds", { page, search }],
        queryFn: () => queryBreeds({ p: page, search }),
        refetchOnWindowFocus: false,
    })

    const breeds = data?.data?.data || []
    const total = data?.data?.total || 0
    const totalPages = Math.ceil(total / 20)

    const { mutate: remove } = useMutation({
        mutationFn: deleteBreed,
        onSuccess: () => {
            toast({ description: "Breed deleted" })
            queryClient.invalidateQueries({ queryKey: ["breeds"] })
        },
        onError: (error) => handleApiError(error, { context: "delete breed" }),
    })

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search breeds..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        className="pl-9 pr-3 block w-full rounded-md bg-white py-1.5 text-sm text-gray-900 outline outline-1 outline-gray-300 dark:bg-white/5 dark:text-white dark:outline-white/10"
                    />
                </div>
                <Link
                    href="/dashboard/farmnport/breeds/new"
                    className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
                >
                    <Icons.add className="w-4 h-4 mr-1.5" />
                    Add Breed
                </Link>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-white/10">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
                    <thead className="bg-gray-50 dark:bg-white/5">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Farm Produce</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-transparent divide-y divide-gray-100 dark:divide-white/5">
                        {isLoading && (
                            <tr><td colSpan={4} className="px-4 py-8 text-center"><Icons.spinner className="w-5 h-5 mx-auto animate-spin text-gray-400" /></td></tr>
                        )}
                        {!isLoading && breeds.length === 0 && (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">No breeds found.</td></tr>
                        )}
                        {breeds.map((breed: any) => (
                            <tr key={breed.id} className="hover:bg-muted/50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{breed.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{breed.farm_produce?.name || "—"}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{breed.description || "—"}</td>
                                <td className="px-4 py-3 text-right flex items-center justify-end gap-3">
                                    <Link href={`/dashboard/farmnport/breeds/${breed.id}/edit`} className="text-sm text-primary hover:text-primary/80">Edit</Link>
                                    <button
                                        onClick={() => { if (confirm(`Delete ${breed.name}?`)) remove(breed.id) }}
                                        className="text-sm text-red-500 hover:text-red-700"
                                    >Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button key={p} onClick={() => setPage(p)}
                            className={`px-3 py-1.5 rounded text-sm font-medium ${p === page ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"}`}>
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
