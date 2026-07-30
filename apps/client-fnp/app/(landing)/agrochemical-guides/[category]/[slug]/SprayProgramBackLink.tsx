"use client"
import { useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export function SprayProgramBackLink() {
    const searchParams = useSearchParams()
    const from = searchParams.get("from")
    if (!from) return null

    const isBuyPage = from.startsWith("buy-")
    const href = isBuyPage ? `/${from}` : `/spray-programs/${from}`
    const label = isBuyPage ? "Back to Product" : "Back to Spray Program"

    return (
        <div className="border-b bg-primary/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
                <Link href={href} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    {label}
                </Link>
            </div>
        </div>
    )
}
