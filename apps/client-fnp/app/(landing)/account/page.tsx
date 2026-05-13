"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const SECTIONS = [
    { label: "Orders", description: "Track your product orders and view order history.", href: "/account/orders" },
    { label: "Bookings", description: "Manage your livestock and delivery bookings.", href: "/account/bookings" },
    { label: "Documents", description: "Download your purchased plans and documents.", href: "/account/documents" },
    { label: "Profile", description: "Update your name, phone number, and address.", href: "/account/profile" },
    { label: "Security", description: "Change your password and manage account security.", href: "/account/security" },
]

export default function AccountPage() {
    const { status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login?next=/account")
        }
    }, [status, router])

    if (status === "loading") return null

    return (
        <div className="grid sm:grid-cols-2 gap-4">
            {SECTIONS.map(({ label, description, href }) => (
                <Link
                    key={href}
                    href={href}
                    className="flex flex-col gap-1 p-5 rounded-xl border border-border bg-card hover:border-primary hover:shadow-sm transition-all group"
                >
                    <p className="font-semibold text-sm group-hover:text-primary transition-colors">{label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
                </Link>
            ))}
        </div>
    )
}
