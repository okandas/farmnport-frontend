"use client"

import Link from "next/link"
import { Tag, ArrowRight, Gavel, ShoppingBag } from "lucide-react"
import { sendGTMEvent } from "@next/third-parties/google"
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
          <p className="text-lg text-muted-foreground">
            Here&apos;s how you can manage your agribusiness today
          </p>
        </div>

        <section className="mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/lots/new"
              onClick={() => sendGTMEvent({ event: "dashboard_cta_click", cta_name: "post_lot" })}
              className="flex items-center justify-between gap-4 rounded-xl border bg-card p-5 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Post New Lot</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Post a lot to sell or request produce</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </Link>
            <Link
              href="/account/bids"
              className="flex items-center justify-between gap-4 rounded-xl border bg-card p-5 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Gavel className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Your Bids</p>
                  <p className="text-xs text-muted-foreground mt-0.5">View and manage your lot bids</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </Link>
            <Link
              href="/account/orders"
              className="flex items-center justify-between gap-4 rounded-xl border bg-card p-5 hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Your Orders</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Track your shop orders</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
