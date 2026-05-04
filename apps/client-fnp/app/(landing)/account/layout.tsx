"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"

const NAV_ITEMS = [
    { label: "Orders", href: "/account/orders" },
    { label: "Bookings", href: "/account/bookings" },
    { label: "Documents", href: "/account/documents" },
    { label: "Profile", href: "/account/profile" },
    { label: "Security", href: "/account/security" },
]

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const user = session?.user as any

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="mx-auto max-w-6xl px-4 lg:px-8 py-8">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold text-lg">
                            {user?.username?.charAt(0)?.toUpperCase() ?? "?"}
                        </span>
                    </div>
                    <div>
                        <p className="font-semibold text-lg leading-tight">{user?.username ?? "My Account"}</p>
                        <p className="text-sm text-muted-foreground">{user?.email ?? ""}</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar nav */}
                    <aside className="w-full lg:w-56 shrink-0">
                        <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                            {NAV_ITEMS.map(({ label, href }) => {
                                const active = pathname === href || pathname.startsWith(href + "/")
                                return (
                                    <Link
                                        key={href}
                                        href={href}
                                        className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                                            active
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        }`}
                                    >
                                        {label}
                                    </Link>
                                )
                            })}
                        </nav>
                    </aside>

                    {/* Page content */}
                    <main className="flex-1 min-w-0">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    )
}
