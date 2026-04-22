"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

import {
  queryRestaurantSubscription,
  queryRestaurantInvoices,
  queryLocationSeats,
  activateRestaurantSubscription,
  cancelRestaurantSubscription,
} from "@/lib/query"
import { RestaurantSubscription, RestaurantInvoice, RestaurantLocationSeat } from "@/lib/schemas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  expired: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
}

const SEAT_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  active: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const INVOICE_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function RestaurantSubscriptionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const id = params.id as string

  const { data: subData, isLoading: subLoading } = useQuery({
    queryKey: ["restaurant-subscription", id],
    queryFn: () => queryRestaurantSubscription(id),
    refetchOnWindowFocus: false,
  })

  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ["restaurant-invoices-for-sub", id],
    queryFn: () => queryRestaurantInvoices({ subscription_id: id }),
    refetchOnWindowFocus: false,
  })

  const { data: seatsData, isLoading: seatsLoading } = useQuery({
    queryKey: ["restaurant-seats-for-sub", id],
    queryFn: () => queryLocationSeats({ subscription_id: id }),
    refetchOnWindowFocus: false,
  })

  const activateMutation = useMutation({
    mutationFn: () => activateRestaurantSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-subscription", id] })
      queryClient.invalidateQueries({ queryKey: ["restaurant-invoices-for-sub", id] })
      queryClient.invalidateQueries({ queryKey: ["restaurant-seats-for-sub", id] })
      toast({ title: "Subscription activated" })
    },
    onError: () => toast({ title: "Failed to activate", variant: "destructive" }),
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelRestaurantSubscription(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["restaurant-subscription", id] })
      toast({ title: "Subscription cancelled" })
    },
    onError: () => toast({ title: "Failed to cancel", variant: "destructive" }),
  })

  const sub: RestaurantSubscription | undefined = subData?.data
  const invoices: RestaurantInvoice[] = invoicesData?.data?.data ?? []
  const seats: RestaurantLocationSeat[] = seatsData?.data?.data ?? []

  if (subLoading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  if (!sub) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Subscription not found</p>
      </div>
    )
  }

  const hasPendingInvoice = invoices.some(inv => inv.status === "pending")

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{sub.restaurant_name}</h2>
            <Badge className={STATUS_COLORS[sub.status] ?? ""}>{sub.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground font-mono">{sub.member_number}</p>
        </div>
        <div className="flex gap-2">
          {/* TODO: manual activation requires proof of payment image upload
          {hasPendingInvoice && sub.status !== "cancelled" && (
            <Button
              onClick={() => activateMutation.mutate()}
              disabled={activateMutation.isPending}
            >
              Activate (Manual Payment)
            </Button>
          )} */}
        </div>
      </div>

      {/* Subscription Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Billing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Email:</span> {sub.billing_email}</p>
            <p><span className="text-muted-foreground">Phone:</span> {sub.billing_phone || "—"}</p>
            <p><span className="text-muted-foreground">Billing day:</span> {sub.billing_day}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cycle</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Current cycle:</span> {format(new Date(sub.cycle_start), "PP")} → {format(new Date(sub.cycle_end), "PP")}</p>
            <p><span className="text-muted-foreground">Created:</span> {sub.created ? format(new Date(sub.created), "PPp") : "—"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Location Seats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Location Seats ({seats.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {seatsLoading ? (
            <Skeleton className="h-24" />
          ) : seats.length === 0 ? (
            <p className="text-sm text-muted-foreground">No seats yet</p>
          ) : (
            <div className="space-y-2">
              {seats.map((seat) => (
                <div key={seat.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{seat.location_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Expires: {format(new Date(seat.expires_at), "PP")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="capitalize text-xs text-muted-foreground">{seat.tier}</span>
                    <Badge className={SEAT_COLORS[seat.status] ?? ""}>{seat.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Invoices ({invoices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {invoicesLoading ? (
            <Skeleton className="h-24" />
          ) : invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices yet</p>
          ) : (
            <div className="space-y-2">
              {invoices.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/dashboard/restaurants/invoices/${inv.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-mono font-medium">{inv.invoice_id}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(inv.cycle_start), "PP")} → {format(new Date(inv.cycle_end), "PP")} · {inv.line_items.length} location{inv.line_items.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">${(inv.total_cents / 100).toFixed(2)}</span>
                    <Badge className={INVOICE_COLORS[inv.status] ?? ""}>{inv.status}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
