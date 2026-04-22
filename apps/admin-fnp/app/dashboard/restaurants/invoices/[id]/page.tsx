"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import { queryRestaurantInvoice, queryRestaurantSubscription } from "@/lib/query"
import { RestaurantInvoice, RestaurantSubscription } from "@/lib/schemas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function RestaurantInvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data, isLoading } = useQuery({
    queryKey: ["restaurant-invoice", id],
    queryFn: () => queryRestaurantInvoice(id),
    refetchOnWindowFocus: false,
  })

  const inv: RestaurantInvoice | undefined = data?.data

  const { data: subData } = useQuery({
    queryKey: ["restaurant-subscription", inv?.subscription_id],
    queryFn: () => queryRestaurantSubscription(inv!.subscription_id),
    enabled: !!inv?.subscription_id,
    refetchOnWindowFocus: false,
  })

  const sub: RestaurantSubscription | undefined = subData?.data

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  if (!inv) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Invoice not found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold font-mono">{inv.invoice_id}</h2>
            <Badge className={STATUS_COLORS[inv.status] ?? ""}>{inv.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {inv.restaurant_name} · Due {format(new Date(inv.due_date), "PP")}
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Invoice Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Subscription:</span>{" "}
              <Link
                href={`/dashboard/restaurants/subscriptions/${inv.subscription_id}`}
                className="font-mono text-blue-600 hover:underline"
              >
                {inv.subscription_id}
              </Link>
            </p>
            <p><span className="text-muted-foreground">Cycle:</span> {format(new Date(inv.cycle_start), "PP")} → {format(new Date(inv.cycle_end), "PP")}</p>
            <p><span className="text-muted-foreground">Due date:</span> {format(new Date(inv.due_date), "PP")}</p>
            {inv.paid_at && (
              <p><span className="text-muted-foreground">Paid at:</span> {format(new Date(inv.paid_at), "PPp")}</p>
            )}
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Member #:</span> <span className="font-mono text-xs">{sub?.member_number}</span></p>
            <p><span className="text-muted-foreground">Provider:</span> <span className="capitalize">{inv.provider || "—"}</span></p>
            <p><span className="text-muted-foreground">Reference:</span> <span className="font-mono">{inv.provider_reference || "—"}</span></p>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Line Items ({inv.line_items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {inv.line_items.map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{item.location_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.days_charged}/{item.days_in_cycle} days
                    {item.days_charged < item.days_in_cycle ? " (prorated)" : ""}
                  </p>
                </div>
                <div className="text-right">
                  {item.days_charged < item.days_in_cycle && (
                    <p className="text-xs text-muted-foreground line-through">${(item.unit_amount_cents / 100).toFixed(2)}</p>
                  )}
                  <p className="text-sm font-medium">${(item.prorated_amount_cents / 100).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${(inv.subtotal_cents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">VAT</span>
              <span>${(inv.vat_cents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-1">
              <span>Total</span>
              <span>${(inv.total_cents / 100).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
