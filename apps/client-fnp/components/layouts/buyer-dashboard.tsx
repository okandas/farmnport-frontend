"use client"

import { AuthenticatedUser } from "@/lib/schemas"

interface BuyerDashboardProps {
  user: AuthenticatedUser
}

export function BuyerDashboard({ user }: BuyerDashboardProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight font-heading mb-2">
            Welcome back, {user?.username}!
          </h1>
        </div>
      </div>
    </main>
  )
}
