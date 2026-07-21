"use client"

import { useEffect } from "react"
import Link from "next/link"
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
            showProgress: true,
            allowClose: true,
            steps: [
                {
                    element: "#booking-cta",
                    popover: {
                        title: `Sell or buy ${displayName} in Zimbabwe`,
                        description: "Two ways to trade on farmnport — choose what fits you best.",
                        side: "bottom",
                        align: "center",
                    },
                },
                {
                    element: "#booking-cta-sell",
                    popover: {
                        title: "Supply or buy frequently?",
                        description: "Create a booking for repeat orders. Buyers and sellers connect directly.",
                        side: "bottom",
                        align: "start",
                    },
                },
                {
                    element: "#booking-cta-lot",
                    popover: {
                        title: "Have stock ready now?",
                        description: "List a lot for immediate sale. Buyers bid or buy directly.",
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
                    id="booking-cta-lot"
                    href="/lots/new"
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                >
                    List a Lot
                </Link>
            </div>
        </div>
    )
}
