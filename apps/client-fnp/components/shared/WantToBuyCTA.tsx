import Link from "next/link"
import { ShoppingCart, Bell } from "lucide-react"

interface WantToBuyCTAProps {
    available_for_sale: boolean
    name: string
    brand?: string
    href: string
    interestHref: string
}

export function WantToBuyCTA({ available_for_sale, name, brand, href, interestHref }: WantToBuyCTAProps) {
    if (available_for_sale) {
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
                    <p className="text-xs text-muted-foreground">Only at Farmnport · shop now</p>
                </div>
                <span className="text-xs font-medium text-primary shrink-0">View →</span>
            </Link>
        )
    }

    return (
        <Link
            href={interestHref}
            className="flex items-center gap-3 rounded-xl border-2 border-muted bg-muted/30 hover:bg-muted/50 hover:border-muted-foreground/30 transition-colors px-4 py-3"
        >
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-muted shrink-0">
                <Bell className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Want to buy this?</p>
                <p className="text-xs text-muted-foreground">Sign in and register your interest</p>
            </div>
            <span className="text-xs font-medium text-muted-foreground shrink-0">Notify me →</span>
        </Link>
    )
}
