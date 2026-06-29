"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { Download, FileText, Loader2, KeyRound } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { myDownloads, downloadDocument } from "@/lib/query"

function formatDate(d: string) {
    return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function DownloadButton({ token, title }: { token: string; title: string }) {
    const [loading, setLoading] = useState(false)

    async function handleDownload() {
        setLoading(true)
        try {
            const res = await downloadDocument(token)
            const url = res.data?.download_url
            if (!url) throw new Error("No download URL returned")
            window.open(url, "_blank", "noopener,noreferrer")
        } catch {
            toast.error("Download failed. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleDownload}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline disabled:opacity-60"
        >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            {loading ? "Preparing…" : "Download"}
        </button>
    )
}

export default function AccountDocumentsPage() {
    const { data: session, status } = useSession()

    const { data, isLoading } = useQuery({
        queryKey: ["my-downloads"],
        queryFn: () => myDownloads().then(r => r.data),
        enabled: !!session,
    })

    if (status === "loading" || isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!session) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="text-center space-y-4">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground/40" />
                    <p className="font-semibold">Sign in to view your downloads</p>
                    <Link
                        href="/login?next=/account/documents"
                        className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 hover:bg-primary/90 transition-colors"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        )
    }

    const downloads: any[] = data?.downloads ?? []

    return (
        <div>
            <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
                <Link href="/account" className="hover:text-foreground transition-colors">Account</Link>
                <span>/</span>
                <span className="text-foreground font-medium">My Downloads</span>
            </nav>
            <h1 className="text-xl font-bold mb-6">My Downloads</h1>

            {downloads.length === 0 ? (
                <div className="text-center py-16 space-y-4">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground/40" />
                    <p className="font-semibold">No downloads yet</p>
                    <p className="text-sm text-muted-foreground">Purchased documents will appear here.</p>
                    <Link
                        href="/documents"
                        className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 hover:bg-primary/90 transition-colors"
                    >
                        Browse Documents
                    </Link>
                </div>
            ) : (
                <div className="divide-y">
                    {downloads.map((item: any) => {
                        const doc = item.document
                        const purchase = item.purchase
                        return (
                            <div key={purchase.id} className="py-4 flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3 min-w-0">
                                    {doc?.preview_images?.[0] ? (
                                        <img src={doc.preview_images[0]} alt={doc.title} className="w-12 h-16 rounded object-cover shrink-0 border border-border" />
                                    ) : (
                                        <div className="w-12 h-16 rounded bg-muted/30 flex items-center justify-center shrink-0 border border-border">
                                            <FileText className="w-5 h-5 text-muted-foreground/40" />
                                        </div>
                                    )}
                                    <div className="space-y-1 min-w-0">
                                        <p className="font-semibold text-sm truncate">{doc?.title}</p>
                                        {doc?.category && (
                                            <p className="text-xs text-muted-foreground capitalize">{doc.category.replace("-", " ")}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground">
                                            Purchased {formatDate(purchase.created)} · {purchase.download_count ?? 0} download{purchase.download_count !== 1 ? "s" : ""}
                                        </p>
                                        {purchase.license_serial && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <KeyRound className="w-3 h-3" />
                                                {purchase.license_serial}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="shrink-0">
                                    <DownloadButton token={purchase.download_token} title={doc?.title ?? "document"} />
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
