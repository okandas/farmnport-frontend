"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ShoppingBag, CalendarDays, Inbox, Bell, FileText, User, Shield, Palette, Gavel } from "lucide-react"

const ACCOUNT_OPTIONS = [
    { label: "Orders", href: "/account/orders", icon: ShoppingBag, protected: true },
    { label: "Bids", href: "/account/bids", icon: Gavel, protected: true },
    { label: "Bookings", href: "/account/bookings", icon: CalendarDays, protected: true },
    { label: "Incoming Bookings", href: "/account/incoming-bookings", icon: Inbox, protected: true },
    { label: "Notifications", href: "/account/notifications", icon: Bell, protected: true },
    { label: "Documents", href: "/account/documents", icon: FileText, protected: true },
    { label: "Profile", href: "/account/profile", icon: User, protected: true },
    { label: "Security", href: "/account/security", icon: Shield, protected: true },
    { label: "Theme", href: "/account/theme", icon: Palette, protected: false },
]

export default function AccountPage() {
    const { status } = useSession()
    const router = useRouter()

    function handleClick(href: string, isProtected: boolean) {
        if (isProtected && status !== "authenticated") {
            router.push(`/login?next=${href}`)
        } else {
            router.push(href)
        }
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {ACCOUNT_OPTIONS.map(({ label, href, icon: Icon, protected: isProtected }) => (
                <button
                    key={href}
                    onClick={() => handleClick(href, isProtected)}
                    className="flex flex-col items-center justify-center gap-3 rounded-xl border bg-card p-6 text-center hover:bg-muted/50 transition-colors"
                >
                    <Icon className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm font-medium">{label}</span>
                </button>
            ))}
        </div>
    )
}
