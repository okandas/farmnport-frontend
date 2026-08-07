"use client"

import { useSearchParams } from "next/navigation"
import { QuickSignupForm } from "@/components/forms/quick-signup"

export function QuickSignupWrapper() {
    const searchParams = useSearchParams()
    const redirectTo = searchParams.get("next") || "/"

    return <QuickSignupForm redirectTo={redirectTo} />
}
