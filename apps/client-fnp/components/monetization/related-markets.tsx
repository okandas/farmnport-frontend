"use client"

import Link from "next/link"
import Image from "next/image"
import { sendGTMEvent } from "@next/third-parties/google"

import logoChicken from "@/assets/logos/chicken.svg"
import logoPig from "@/assets/logos/pig.svg"
import logoCattle from "@/assets/logos/cattle.svg"
import logoChilli from "@/assets/logos/chilli.svg"
import logoTomato from "@/assets/logos/tomato.svg"
import logoOnion from "@/assets/logos/onion.svg"

const allMarkets = [
    { name: "Chicken", slug: "chicken", logo: logoChicken },
    { name: "Pork", slug: "pork", logo: logoPig },
    { name: "Onions", slug: "onions", logo: logoOnion },
    { name: "Cattle", slug: "cattle", logo: logoCattle },
    { name: "Tomatoes", slug: "tomatoes", logo: logoTomato },
    { name: "Chilli", slug: "chilli", logo: logoChilli },
]

interface RelatedMarketsProps {
    currentProduct: string
    context: "buyer" | "farmer"
}

export function RelatedMarkets({ currentProduct, context }: RelatedMarketsProps) {
    const basePath = context === "buyer" ? "/buyers" : "/farmers"
    const related = allMarkets.filter(m => m.slug !== currentProduct.toLowerCase()).slice(0, 4)

    return (
        <div className="mt-12 mb-8">
            <h2 className="text-xl font-bold font-heading mb-4">Explore Other Markets</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {related.map((market) => (
                    <Link
                        key={market.slug}
                        href={`${basePath}/${market.slug}`}
                        className="flex items-center gap-3 rounded-lg border bg-card p-4 transition hover:border-primary/50 hover:shadow-md group"
                        onClick={() => sendGTMEvent({ event: "click", value: `RelatedMarket${market.name}` })}
                    >
                        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full shadow-sm ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
                            <Image src={market.logo} alt="" className="h-7 w-7" unoptimized />
                        </div>
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">{market.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    )
}
