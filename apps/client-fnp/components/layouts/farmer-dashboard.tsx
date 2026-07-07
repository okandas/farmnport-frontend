"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { sendGTMEvent } from "@next/third-parties/google"
import { ChevronRight, Eye, ArrowRight } from "lucide-react"
import { AuthenticatedUser } from "@/lib/schemas"
import { queryDashboardAggregates, queryViewersList } from "@/lib/query"
import { capitalizeFirstLetter } from "@/lib/utilities"

interface FarmerDashboardProps {
  user: AuthenticatedUser
}

export function FarmerDashboard({ user }: FarmerDashboardProps) {
  const { data: aggregates, isLoading } = useQuery({
    queryKey: ["dashboard-aggregates"],
    queryFn: queryDashboardAggregates,
    refetchOnWindowFocus: false,
  })

  const otherProduce: any[] = aggregates?.data?.other_produce || []
  const mainProduceSlug: string = aggregates?.data?.main_produce?.slug || ""


  const { data: viewersData } = useQuery({
    queryKey: ["dashboard-viewers"],
    queryFn: queryViewersList,
    refetchOnWindowFocus: false,
  })
  const viewers: { user_id: string; name: string; type: string; date: string }[] = viewersData?.data?.viewers || []
  const totalViewers: number = viewersData?.data?.total || 0

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


        {/* Agribusiness actions */}
        <section className="mb-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href="/lots/new"
              onClick={() => sendGTMEvent({ event: "dashboard_cta_click", cta_name: "post_lot" })}
              className="flex items-center justify-between gap-4 rounded-xl border bg-card p-5 hover:bg-muted/50 transition-colors group"
            >
              <div>
                <p className="text-sm font-semibold">Post New Lot</p>
                <p className="text-xs text-muted-foreground mt-0.5">Post a lot to sell or request produce</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </Link>
            <Link
              href="/account/bids"
              className="flex items-center justify-between gap-4 rounded-xl border bg-card p-5 hover:bg-muted/50 transition-colors group"
            >
              <div>
                <p className="text-sm font-semibold">Your Bids</p>
                <p className="text-xs text-muted-foreground mt-0.5">View and manage your lot bids</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </Link>
            <Link
              href="/account/orders"
              className="flex items-center justify-between gap-4 rounded-xl border bg-card p-5 hover:bg-muted/50 transition-colors group"
            >
              <div>
                <p className="text-sm font-semibold">Your Orders</p>
                <p className="text-xs text-muted-foreground mt-0.5">Track your shop orders</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </Link>
            <Link
              href="/account/bookings"
              className="flex items-center justify-between gap-4 rounded-xl border bg-card p-5 hover:bg-muted/50 transition-colors group"
            >
              <div>
                <p className="text-sm font-semibold">Your Bookings</p>
                <p className="text-xs text-muted-foreground mt-0.5">View and manage your pre-orders</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
            </Link>
          </div>
        </section>


        {/* Who Viewed Your Contact */}
        {totalViewers > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight font-heading">
                Who Viewed Your Contact
              </h2>
              <span className="ml-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {totalViewers}
              </span>
            </div>
            <div className="rounded-lg border bg-card divide-y">
              {viewers.slice(0, 10).map((v, i) => (
                <div key={`${v.user_id}-${v.type}-${v.date}-${i}`} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-primary">
                        {v.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{v.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="capitalize">{v.type}</span>
                    {v.date && v.date !== "undefined" && (
                      <span>{v.date}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  )
}
