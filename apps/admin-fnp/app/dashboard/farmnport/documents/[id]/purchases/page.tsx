"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Loader2, KeyRound } from "lucide-react"

import { adminDocumentPurchases, adminGetDocument } from "@/lib/query"

function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export default function DocumentPurchasesPage() {
    const { id } = useParams<{ id: string }>()

    const { data: docData, isLoading: docLoading } = useQuery({
        queryKey: ["admin-document", id],
        queryFn: () => adminGetDocument(id).then(r => r.data),
        enabled: !!id,
    })

    const { data: purchasesData, isLoading: purchasesLoading } = useQuery({
        queryKey: ["admin-document-purchases", id],
        queryFn: () => adminDocumentPurchases(id).then(r => r.data),
        enabled: !!id,
    })

    const isLoading = docLoading || purchasesLoading
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    const doc = docData?.document
    const purchases: any[] = purchasesData?.purchases ?? []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-1">
                        <Link href="/dashboard/farmnport/documents" className="hover:text-foreground">Documents</Link>
                        <span>/</span>
                        <span className="text-foreground font-medium truncate">{doc?.title ?? id}</span>
                        <span>/</span>
                        <span className="text-foreground font-medium">Purchases</span>
                    </nav>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Purchases
                    </h1>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                        {purchases.length} purchase{purchases.length !== 1 ? "s" : ""} for this document
                    </p>
                </div>
                <Link
                    href={`/dashboard/farmnport/documents/${id}/edit`}
                    className="text-sm font-medium text-primary hover:underline"
                >
                    Edit Document
                </Link>
            </div>

            {purchases.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    No purchases yet.
                </div>
            ) : (
                <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Buyer</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">License</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Downloads</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {purchases.map((p: any) => (
                                <tr key={p.id} className="hover:bg-muted/50">
                                    <td className="px-4 py-3">
                                        <span className="font-medium">{p.client_id}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                                            <KeyRound className="w-3 h-3" />
                                            {p.license_serial ?? "—"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {p.download_count ?? 0}
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {p.created ? formatDate(p.created) : "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        {p.is_revoked
                                            ? <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">Revoked</span>
                                            : <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">Active</span>
                                        }
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
