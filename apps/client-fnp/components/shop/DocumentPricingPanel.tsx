"use client"

import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Download, Loader2, Share2, BookOpen } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { myDownloads, downloadDocument } from "@/lib/query"
import { AddToCartButton } from "@/components/cart/AddToCartButton"

interface Props {
    docId: string
    docSlug: string
    docTitle: string
    priceCents: number | null
    price: string
}

export function DocumentPricingPanel({ docId, docSlug, docTitle, priceCents, price }: Props) {
    const { data: session } = useSession()
    const [downloading, setDownloading] = useState(false)

    const { data, isLoading } = useQuery({
        queryKey: ["my-downloads"],
        queryFn: () => myDownloads().then(r => r.data),
        enabled: !!session,
    })

    const downloads: any[] = data?.downloads ?? []
    const owned = downloads.find((d: any) => d.document?.slug === docSlug)
    const token = owned?.purchase?.download_token

    async function handleDownload() {
        setDownloading(true)
        try {
            const res = await downloadDocument(token)
            const url = res.data?.download_url
            if (!url) throw new Error("No download URL")
            window.open(url, "_blank", "noopener,noreferrer")
        } catch {
            toast.error("Download failed. Please try again.")
        } finally {
            setDownloading(false)
        }
    }

    return (
        <div className="border rounded-xl bg-card overflow-hidden">
<div className="p-4 border-b">
                {owned ? (
                    <>
                        <p className="text-sm font-semibold text-muted-foreground">You own this document</p>
                        <p className="text-[11px] text-muted-foreground mt-2">One-time purchase · instant download</p>
                        <button
                            onClick={handleDownload}
                            disabled={downloading || isLoading}
                            className="flex items-center justify-center gap-2 w-full border border-border hover:bg-muted disabled:opacity-60 text-foreground font-medium text-sm h-9 px-3 rounded-md transition-colors mt-3"
                        >
                            {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                            {downloading ? "Preparing…" : "Download Document"}
                        </button>
                        <Link
                            href="/account/documents"
                            className="flex items-center justify-center gap-2 w-full border border-border hover:bg-muted text-foreground font-medium text-sm h-9 px-3 rounded-md transition-colors mt-2"
                        >
                            <BookOpen className="w-3.5 h-3.5" />
                            View in My Documents
                        </Link>
                    </>
                ) : (
                    <>
                        <p className="text-3xl font-bold leading-none">{price}</p>
                        <p className="text-[11px] text-muted-foreground mt-2">One-time purchase · instant download</p>
                        <AddToCartButton
                            productId={docId}
                            productType="document"
                            productName={docTitle}
                            productSlug={docSlug}
                            unitPrice={priceCents}
                            loginRedirect={`/buy-documents/${docSlug}`}
                            singleUnit
                        />
                    </>
                )}
            </div>
            <div className="px-5 pb-5 space-y-2.5 text-xs text-muted-foreground pt-4">
                <div className="flex items-center gap-1.5">
                    <span className="font-medium text-foreground">Sold by</span>
                    <span>farmnport</span>
                </div>
                <div className="flex items-start gap-1.5">
                    <Share2 className="w-3 h-3 shrink-0 mt-0.5" />
                    <span>Digital delivery — no shipping required</span>
                </div>
            </div>
        </div>
    )
}
