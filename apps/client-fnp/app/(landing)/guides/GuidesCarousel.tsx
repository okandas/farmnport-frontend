"use client"

import { useRef } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

function ProductCard({ product, slugBase }: { product: any; slugBase: string }) {
    const image = product.images?.[0]?.img?.src || product.main_image
    const name = product.name
    const brand = product.brand?.name

    return (
        <Link
            href={`${slugBase}/${product.slug}`}
            className="shrink-0 w-44 sm:w-48 rounded-lg border bg-card overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-200 group flex flex-col"
        >
            <div className="aspect-square bg-muted/30 dark:bg-white relative">
                {image ? (
                    <img src={image} alt={name} className="absolute inset-0 w-full h-full object-contain p-3" />
                ) : (
                    <div className="absolute inset-0 bg-muted/30" />
                )}
            </div>
            <div className="p-3 border-t flex-1">
                <p className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors capitalize">{name}</p>
                {brand && <p className="text-xs text-muted-foreground mt-1 capitalize">{brand}</p>}
            </div>
        </Link>
    )
}

export function GuidesCarousel({ products, slugBase }: { products: any[]; slugBase: string }) {
    const scrollRef = useRef<HTMLDivElement>(null)

    function scroll(dir: "left" | "right") {
        scrollRef.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" })
    }

    return (
        <div className="relative">
            <button
                onClick={() => scroll("left")}
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center h-9 w-9 rounded-full border bg-background shadow-sm hover:bg-muted transition-colors"
            >
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </button>
            <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide py-1 px-1">
                {products.map((product) => (
                    <ProductCard key={product._id || product.id} product={product} slugBase={slugBase} />
                ))}
            </div>
            <button
                onClick={() => scroll("right")}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center h-9 w-9 rounded-full border bg-background shadow-sm hover:bg-muted transition-colors"
            >
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
        </div>
    )
}
