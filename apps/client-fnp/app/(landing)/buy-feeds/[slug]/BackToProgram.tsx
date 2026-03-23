"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

export function BackToProgram() {
    const searchParams = useSearchParams()
    const ref = searchParams.get("ref")

    if (!ref) return null

    return (
        <Link
            href={`/feeding-programs/${ref}`}
            className="text-sm text-primary hover:underline inline-flex items-center gap-2"
        >
            Back to Feeding Program
            <span>&rarr;</span>
        </Link>
    )
}
