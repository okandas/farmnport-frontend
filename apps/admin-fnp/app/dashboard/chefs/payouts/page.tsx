"use client"

import { Suspense, useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSearchParams } from "next/navigation"
import { PaginationState } from "@tanstack/react-table"
import { format } from "date-fns"

import { adminListChefPayouts, adminMarkChefPayoutPaid } from "@/lib/query"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { FormSkeleton } from "@/components/state/skeleton-table"
import { DashboardShell } from "@/components/state/dashboardShell"
import { Placeholder } from "@/components/state/placeholder"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { DataTableFacetedFilter } from "@/components/structures/filters/data-table-faceted-filter"
import { Card, CardContent } from "@/components/ui/card"

const statusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Paid",    value: "paid" },
]

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid:    "bg-green-100 text-green-800",
}

interface PayoutRow {
  id: string
  chef_name: string
  gross_amount: number
  commission_amount: number
  commission_pct: number
  transfer_fee: number
  net_paid: number
  bank_name: string
  account_number: string
  payout_date?: string
  status: string
  created: string
}

export default function ChefPayoutsPage() {
  return (
    <Suspense fallback={<DashboardShell><FormSkeleton /></DashboardShell>}>
      <ChefPayoutsContent />
    </Suspense>
  )
}

function ChefPayoutsContent() {
  const searchParams = useSearchParams()
  const chefID = searchParams.get("chef_id") ?? ""
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set())
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const queryClient = useQueryClient()
  const { toast } = useToast()

  useEffect(() => {
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }, [statusFilter])

  const { isError, isLoading, isFetching, data } = useQuery({
    queryKey: ["admin-chef-payouts", { chef_id: chefID, status: Array.from(statusFilter)[0], p: pagination.pageIndex + 1 }],
    queryFn: () => adminListChefPayouts({
      chef_id: chefID || undefined,
      status: Array.from(statusFilter)[0],
      p: pagination.pageIndex + 1,
    }),
    refetchOnWindowFocus: false,
  })

  const markPaidMutation = useMutation({
    mutationFn: (id: string) => adminMarkChefPayoutPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chef-payouts"] })
      toast({ title: "Payout marked as paid" })
    },
    onError: () => toast({ title: "Failed to mark payout", variant: "destructive" }),
  })

  const payouts = (data?.data?.payouts as PayoutRow[]) ?? []
  const total = (data?.data?.total as number) ?? 0

  if (isError) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Chef Payouts" text="Manage payout queue." />
        <Placeholder>
          <Placeholder.Icon name="close" />
          <Placeholder.Title>Error Fetching Payouts</Placeholder.Title>
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
      <DashboardHeader heading="Chef Payouts" text={`${total} payout${total !== 1 ? "s" : ""}`} />
      <div className="mb-4">
        <DataTableFacetedFilter
          title="Status"
          options={statusOptions}
          selectedValues={statusFilter}
          onValueChange={setStatusFilter}
        />
      </div>
      {payouts.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No payouts found.</p>
      ) : (
        <div className="space-y-3">
          {payouts.map((payout) => (
            <Card key={payout.id}>
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium">{payout.chef_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Gross ${(payout.gross_amount / 100).toFixed(2)}
                    {" "}&middot; {payout.commission_pct}% commission ${(payout.commission_amount / 100).toFixed(2)}
                    {" "}&middot; Fee ${(payout.transfer_fee / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {payout.bank_name} &middot; {payout.account_number}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Created {format(new Date(payout.created), "d MMM yyyy")}
                    {payout.payout_date && ` · Paid ${format(new Date(payout.payout_date), "d MMM yyyy")}`}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <Badge className={STATUS_COLORS[payout.status] ?? ""}>{payout.status}</Badge>
                  <p className="text-lg font-semibold">${(payout.net_paid / 100).toFixed(2)}</p>
                  {payout.status === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => markPaidMutation.mutate(payout.id)}
                      disabled={markPaidMutation.isPending}
                    >
                      Mark Paid
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  )
}
