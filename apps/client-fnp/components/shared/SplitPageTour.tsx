"use client"

import { useEffect } from "react"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

interface SplitPageTourProps {
    storageKey: string
    steps: { element: string; title: string; description: string }[]
}

export function SplitPageTour({ storageKey, steps }: SplitPageTourProps) {
    useEffect(() => {
        if (typeof window === "undefined") return
        if (localStorage.getItem(storageKey)) return

        const first = document.getElementById(steps[0]?.element?.replace("#", ""))
        if (!first) return

        localStorage.setItem(storageKey, "1")

        const d = driver({
            showProgress: true,
            allowClose: true,
            steps: steps.map((s) => ({
                element: s.element,
                popover: {
                    title: s.title,
                    description: s.description,
                    side: "bottom" as const,
                    align: "center" as const,
                },
            })),
        })

        const t = setTimeout(() => d.drive(), 1000)
        return () => clearTimeout(t)
    }, [storageKey, steps])

    return null
}
