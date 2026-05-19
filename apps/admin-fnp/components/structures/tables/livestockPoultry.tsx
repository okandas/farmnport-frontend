"use client"

import { useState } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"

import { queryLivestockPoultryProducts } from "@/lib/query"
import { Icons } from "@/components/icons/lucide"

export function LivestockPoultryTable() {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState("")

    const { data, isLoading } = useQuery({
        queryKey: ["livestock-poultry-products", { page, search }],
        queryFn: () => queryLivestockPoultryProducts({ p: page, search }),
        refetchOnWindowFocus: false,
    })

    const products = data?.data?.data || []
    const total = data?.data?.total || 0
    const totalPages = Math.ceil(total / 10)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        className="pl-9 block w-full rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 outline outline-1 outline-gray-300 dark:bg-white/5 dark:text-white dark:outline-white/10"
                    />
                </div>
                <Link
                    href="/dashboard/farmnport/livestock-poultry/new"
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
                >
                    <Icons.add className="w-4 h-4 mr-1.5" />
                    Add Product
                </Link>
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-white/10">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-white/10">
                    <thead className="bg-gray-50 dark:bg-white/5">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Species</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type / Breed</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Brand</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">For Sale</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-transparent divide-y divide-gray-100 dark:divide-white/5">
                        {isLoading && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                    <Icons.spinner className="w-5 h-5 mx-auto animate-spin" />
                                </td>
                            </tr>
                        )}
                        {!isLoading && products.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No products found.
                                </td>
                            </tr>
                        )}
                        {products.map((product: any) => (
                            <tr key={product.id} className="hover:bg-muted/50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white capitalize">{product.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 capitalize">{product.species}</td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                    {product.type}{product.breed ? ` · ${product.breed}` : ""}
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{product.brand?.name || "—"}</td>
                                <td className="px-4 py-3 text-sm">
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${product.available_for_sale ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400"}`}>
                                        {product.available_for_sale ? "Active" : "Draft"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <Link
                                        href={`/dashboard/farmnport/livestock-poultry/${product.id}/edit`}
                                        className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                                    >
                                        Edit
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`px-3 py-1.5 rounded text-sm font-medium ${p === page ? "bg-indigo-600 text-white dark:bg-indigo-500" : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"}`}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
