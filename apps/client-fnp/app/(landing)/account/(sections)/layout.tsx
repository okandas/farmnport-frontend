"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
    { label: "Bookings", href: "/account/bookings" },
    { label: "Documents", href: "/account/documents" },
    { label: "Profile", href: "/account/profile" },
    { label: "Security", href: "/account/security" },
]

export default function AccountSectionsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <div className="flex flex-col lg:flex-row gap-8">
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
            <main className="flex-1 min-w-0">
                {children}
            </main>
        </div>
    )
}
