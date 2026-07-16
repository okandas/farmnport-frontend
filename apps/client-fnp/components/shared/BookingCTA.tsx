"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Truck } from "lucide-react"
import pluralize from "pluralize"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

interface BookingCTAProps {
    produce: string
}

export function BookingCTA({ produce }: BookingCTAProps) {
    const displayName = produce ? pluralize(produce.replace(/-/g, " ")) : "produce"

    useEffect(() => {
        const key = "fnp_booking_cta_seen"
        if (typeof window === "undefined") return
        if (localStorage.getItem(key)) return

        const el = document.getElementById("booking-cta-sell")
        if (!el) return

        localStorage.setItem(key, "1")

        const d = driver({
            showProgress: false,
            allowClose: true,
            steps: [
                {
                    element: "#booking-cta-sell",
                    popover: {
                        title: `Supply ${displayName}?`,
                        description: "Create a booking and reach buyers directly.",
                        side: "bottom",
                        align: "start",
                    },
                },
                {
                    element: "#booking-cta-buy",
                    popover: {
                        title: `Buy ${displayName}?`,
                        description: "Browse available bookings.",
                        side: "bottom",
                        align: "start",
                    },
                },
            ],
        })

        const t = setTimeout(() => d.drive(), 1500)
        return () => clearTimeout(t)
    }, [displayName])

    return (
        <div id="booking-cta" className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-5 py-3 mt-4 mb-6">
            <p className="text-sm font-semibold text-foreground shrink-0">Sell or buy {displayName} in Zimbabwe</p>
            <div className="flex gap-3 ml-auto">
                <Link
                    id="booking-cta-sell"
                    href="/bookings/new"
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    Create Booking
                </Link>
                <Link
                    id="booking-cta-buy"
                    href="/bookings"
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                >
                    <Truck className="w-4 h-4" />
                    Supply or Buy
                </Link>
            </div>
        </div>
    )
}
