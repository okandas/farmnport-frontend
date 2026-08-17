"use client"

import { Suspense, useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { PaginationState } from "@tanstack/react-table"
import Link from "next/link"
import { format } from "date-fns"

import { adminListChefSubscriptions } from "@/lib/query"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { FormSkeleton } from "@/components/state/skeleton-table"
import { DashboardShell } from "@/components/state/dashboardShell"
import { Placeholder } from "@/components/state/placeholder"
import { Badge } from "@/components/ui/badge"
import { DataTableFacetedFilter } from "@/components/structures/filters/data-table-faceted-filter"
import { Card, CardContent } from "@/components/ui/card"

const statusOptions = [
  { label: "Active",    value: "active" },
  { label: "Paused",    value: "paused" },
  { label: "Expired",   value: "expired" },
  { label: "Cancelled", value: "cancelled" },
]

const STATUS_COLORS: Record<string, string> = {
  active:    "bg-green-100 text-green-800",
  paused:    "bg-yellow-100 text-yellow-800",
  expired:   "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-800",
}

interface SubscriptionRow {
  id: string
  subscription_ref: string
  chef_name: string
  client_name: string
  plan_name: string
  size_variant: string
  total_paid: number
  status: string
  expires_at: string
  created: string
}

export default function ChefSubscriptionsPage() {
  return (
    <Suspense fallback={<DashboardShell><FormSkeleton /></DashboardShell>}>
      <ChefSubscriptionsContent />
    </Suspense>
  )
}

function ChefSubscriptionsContent() {
  const searchParams = useSearchParams()
  const chefID = searchParams.get("chef_id") ?? ""
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set())
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [statusFilter])

  const { isError, isLoading, isFetching, data } = useQuery({
    queryKey: ["admin-chef-subscriptions", { chef_id: chefID, status: Array.from(statusFilter)[0], p: pagination.pageIndex + 1 }],
    queryFn: () => adminListChefSubscriptions({
      chef_id: chefID || undefined,
      status: Array.from(statusFilter)[0],
      p: pagination.pageIndex + 1,
    }),
    refetchOnWindowFocus: false,
  })

  const subscriptions = (data?.data?.subscriptions as SubscriptionRow[]) ?? []
  const total = (data?.data?.total as number) ?? 0

  if (isError) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Chef Subscriptions" text="Manage meal plan subscriptions." />
        <Placeholder>
          <Placeholder.Icon name="close" />
          <Placeholder.Title>Error Fetching Subscriptions</Placeholder.Title>
          <Placeholder.Description>Something went wrong.</Placeholder.Description>
        </Placeholder>
      </DashboardShell>
    )
  }

  if (isLoading || isFetching) {
    return (
      <DashboardShell>
        <FormSkeleton />
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="Chef Subscriptions" text={`${total} subscription${total !== 1 ? "s" : ""}`} />
      <div className="mb-4">
        <DataTableFacetedFilter
          title="Status"
          options={statusOptions}
          selectedValues={statusFilter}
          onValueChange={setStatusFilter}
        />
      </div>
      {subscriptions.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No subscriptions found.</p>
      ) : (
        <div className="space-y-3">
          {subscriptions.map((sub) => (
            <Link key={sub.id} href={`/dashboard/chefs/subscriptions/${sub.id}`}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-mono text-xs text-primary">{sub.subscription_ref}</p>
                    <p className="text-sm font-medium mt-1">{sub.client_name} &rarr; {sub.chef_name}</p>
                    <p className="text-xs text-muted-foreground">{sub.plan_name} &middot; {sub.size_variant}</p>
                  </div>
                  <div className="text-right">
                    <Badge className={STATUS_COLORS[sub.status] ?? ""}>{sub.status}</Badge>
                    <p className="text-sm font-medium mt-1">${(sub.total_paid / 100).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Expires {format(new Date(sub.expires_at), "d MMM yyyy")}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  )
}
