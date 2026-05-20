"use client"

import { useSession } from "next-auth/react"

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession()
    const user = session?.user as any

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="mx-auto max-w-6xl px-4 lg:px-8 py-8">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary font-bold text-lg">
                            {user?.username?.charAt(0)?.toUpperCase() ?? "A"}
                        </span>
                    </div>
                    <div>
                        <p className="font-semibold text-lg leading-tight">{user?.username ? `Hi, ${user.username}` : "My Account"}</p>
                        {user?.email && <p className="text-sm text-muted-foreground">{user.email}</p>}
                    </div>
                </div>

                {children}
            </div>
        </div>
    )
}
