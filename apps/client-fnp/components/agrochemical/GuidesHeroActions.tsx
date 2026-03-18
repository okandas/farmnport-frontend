"use client"

import { sendGTMEvent } from "@next/third-parties/google"
import Link from "next/link"
import { Search, Sprout, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function GuidesHeroActions() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
                size="lg"
                asChild
                onClick={() => sendGTMEvent({ event: "click", value: "ReadGuides" })}
                className="text-base px-6 py-5 h-auto font-semibold shadow-lg hover:shadow-xl transition-all group"
            >
                <Link href="/agrochemical-guides/all" className="flex items-center gap-2">
                    <Search className="h-5 w-5" />
                    Browse All Products
                </Link>
            </Button>
            <Button
                size="lg"
                variant="outline"
                asChild
                className="text-base px-6 py-5 h-auto font-semibold transition-all group"
            >
                <Link href="/spray-programs" className="flex items-center gap-2">
                    <Sprout className="h-5 w-5" />
                    All Spray Programs
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </Button>
        </div>
    )
}
