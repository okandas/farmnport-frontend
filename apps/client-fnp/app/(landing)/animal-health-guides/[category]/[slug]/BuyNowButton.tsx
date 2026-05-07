"use client"

import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { sendGTMEvent } from "@next/third-parties/google"

interface BuyNowButtonProps {
    slug: string
}

export function BuyNowButton({ slug }: BuyNowButtonProps) {
    return (
        <Link
            href={`/buy-animal-health/${slug}`}
            onClick={() => sendGTMEvent({ event: 'buy_now_click', value: slug, category: 'animal_health' })}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
        >
            <ShoppingCart className="h-5 w-5" />
            Buy Now
        </Link>
    )
}
