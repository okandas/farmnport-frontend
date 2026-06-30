"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { sendGTMEvent } from "@next/third-parties/google"
import { Bell, CheckCircle2, LogIn, Clock } from "lucide-react"
import Link from "next/link"
import { recordProductInterest } from "@/lib/query"

interface Props {
    productType: string
    slug: string
    name: string
    loginRedirect: string
}

type State = "idle" | "done" | "repeat" | "error"

export function InterestClient({ productType, slug, name, loginRedirect }: Props) {
    const { data: session, status } = useSession()
    const [state, setState] = useState<State>("idle")

    useEffect(() => {
        if (status === "loading") return
        if (!session) return

        sendGTMEvent({ event: "product_interest", product_type: productType, slug, item_name: name })

        recordProductInterest(productType, slug)
            .then((res: any) => {
                if (res?.data?.status === "already_registered") {
                    setState("repeat")
                } else {
                    setState("done")
                }
            })
            .catch(() => setState("error"))
    }, [session, status, productType, slug, name])

    if (status === "loading") {
        return <div className="h-20 flex items-center justify-center text-muted-foreground text-sm">Loading…</div>
    }

    if (!session) {
        return (
            <div className="rounded-xl border-2 border-dashed border-muted p-6 text-center space-y-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mx-auto">
                    <LogIn className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold">Sign in to register your interest</p>
                <p className="text-xs text-muted-foreground">We'll notify you as soon as this becomes available for purchase.</p>
                <Link
                    href={`/login?redirect=${encodeURIComponent(loginRedirect)}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                    <LogIn className="w-4 h-4" />
                    Sign in
                </Link>
            </div>
        )
    }

    if (state === "repeat") {
        return (
            <div className="rounded-xl border-2 border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/30 p-6 text-center space-y-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 mx-auto">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">You've already requested to buy this</p>
                <p className="text-xs text-muted-foreground">We have your request and are working on making <span className="font-medium">{name}</span> available. We'll notify you.</p>
            </div>
        )
    }

    if (state === "error") {
        return (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center space-y-2">
                <p className="text-sm font-semibold text-destructive">Something went wrong</p>
                <p className="text-xs text-muted-foreground">We couldn't register your interest. Please try again later.</p>
            </div>
        )
    }

    if (state === "done") {
        return (
            <div className="rounded-xl border-2 border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30 p-6 text-center space-y-2">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 mx-auto">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-sm font-semibold text-green-800 dark:text-green-300">You're on the list</p>
                <p className="text-xs text-muted-foreground">We'll notify you when <span className="font-medium">{name}</span> becomes available.</p>
            </div>
        )
    }

    return (
        <div className="h-20 flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <Bell className="w-4 h-4 animate-pulse" />
            Registering your interest…
        </div>
    )
}
