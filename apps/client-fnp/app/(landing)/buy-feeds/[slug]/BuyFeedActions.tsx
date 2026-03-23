"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Heart, Share2 } from "lucide-react"

export function BuyFeedActions() {
    return (
        <div className="space-y-3">
            <div className="flex gap-3">
                <Link href="/waiting-list-shop" className="flex-1">
                    <Button size="lg" className="w-full">
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Add to Cart
                    </Button>
                </Link>
                <Button size="lg" variant="outline">
                    <Heart className="w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline">
                    <Share2 className="w-5 h-5" />
                </Button>
            </div>
            <Link href="/waiting-list-shop">
                <Button size="lg" variant="secondary" className="w-full">
                    Buy Now
                </Button>
            </Link>
        </div>
    )
}
