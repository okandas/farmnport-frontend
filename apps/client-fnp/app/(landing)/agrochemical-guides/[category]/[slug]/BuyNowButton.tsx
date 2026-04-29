"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { sendGTMEvent } from "@next/third-parties/google"

export function BuyNowButton({ slug }: { slug: string }) {
    return (
        <Link
            href={`/buy-agrochemicals/${slug}`}
            onClick={() => sendGTMEvent({ event: 'buy_now_click', value: slug, category: 'agrochemical' })}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
        >
            <ShoppingCart className="h-5 w-5" />
            Buy Now
        </Link>
    )
}
