"use client"

import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { makeAbbveriation } from "@/lib/utilities"

export default function AccountLayout({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession()
    const user = session?.user as any

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="mx-auto max-w-6xl px-4 lg:px-8 py-8">

                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Avatar className="h-12 w-12">
                        <AvatarFallback className="text-lg">{makeAbbveriation(user?.username)}</AvatarFallback>
                    </Avatar>
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
