import Link from "next/link"
import { ShoppingCart } from "lucide-react"

interface WantToBuyCTAProps {
    available_for_sale: boolean
    name: string
    brand?: string
    href: string
    interestHref: string
}

export function WantToBuyCTA({ name, brand, href }: WantToBuyCTAProps) {
    const label = brand ? `${name} ${brand}` : name
    return (
        <Link
            href={href}
            className="flex items-center gap-3 rounded-xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-colors px-4 py-3"
        >
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 shrink-0">
                <ShoppingCart className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Buy {label} online</p>
                <p className="text-xs text-muted-foreground">View price and purchase on Farmnport</p>
            </div>
            <span className="text-xs font-medium text-primary shrink-0">Buy now →</span>
        </Link>
    )
}
