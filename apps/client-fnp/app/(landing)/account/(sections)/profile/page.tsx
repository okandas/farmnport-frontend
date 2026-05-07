"use client"

import { useSession } from "next-auth/react"

export default function AccountProfilePage() {
    const { data: session } = useSession()
    const user = session?.user as any

    return (
        <div className="space-y-6">
            <h1 className="text-xl font-bold">Profile</h1>
            <div className="border rounded-xl divide-y">
                {[
                    { label: "Username", value: user?.username },
                    { label: "Email", value: user?.email },
                ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-5 py-4">
                        <span className="text-sm text-muted-foreground">{label}</span>
                        <span className="text-sm font-medium">{value ?? "—"}</span>
                    </div>
                ))}
            </div>
            <p className="text-xs text-muted-foreground">Profile editing coming soon.</p>
        </div>
    )
}
