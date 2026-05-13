import Link from "next/link"
import { ShoppingCart } from "lucide-react"

interface WantToBuyCTAProps {
    available_for_sale: boolean
    name: string
    href: string
}

export function WantToBuyCTA({ available_for_sale, name, href }: WantToBuyCTAProps) {
    if (!available_for_sale) return null

    return (
        <Link
            href={href}
            className="flex items-center gap-3 rounded-xl border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-colors px-4 py-3"
        >
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 shrink-0">
                <ShoppingCart className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Want to buy {name}?</p>
                <p className="text-xs text-muted-foreground">Find sellers &amp; compare prices</p>
            </div>
            <span className="text-xs font-medium text-primary shrink-0">View →</span>
        </Link>
    )
}
