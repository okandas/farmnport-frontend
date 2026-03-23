"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useSearchParams } from "next/navigation"

export function FeedBreadcrumb({ productName }: { productName: string }) {
    const searchParams = useSearchParams()
    const ref = searchParams.get("ref")

    if (ref) {
        return (
            <Link href={`/feeding-programs/${ref}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Feeding Program
            </Link>
        )
    }

    return (
        <nav className="flex text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/feeds" className="hover:text-foreground">Feeds</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground capitalize">{productName}</span>
        </nav>
    )
}
