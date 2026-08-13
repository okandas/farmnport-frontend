"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { ArrowLeft } from "lucide-react"

import { adminGetChefSubscription, adminUpdateChefSubscriptionStatus } from "@/lib/query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

const STATUS_COLORS: Record<string, string> = {
  active:    "bg-green-100 text-green-800",
  paused:    "bg-yellow-100 text-yellow-800",
  expired:   "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-800",
}

interface SubscriptionDetail {
  id: string
  subscription_ref: string
  chef_id: string
  chef_name: string
  listing_id: string
  client_id: string
  client_name: string
  client_email?: string
  client_phone?: string
  plan_name: string
  size_variant: string
  dietary_pref?: string
  delivery_days: string[]
  delivery_address: string
  add_ons?: { name: string; price: number; quantity: number }[]
  plan_price: number
  add_ons_total: number
  service_fee: number
  total_paid: number
  commission_pct: number
  paynow_ref?: string
  status: string
  expires_at: string
  paused_at?: string
  created: string
  updated: string
}

function getActions(status: string): { label: string; status: string; variant: "default" | "destructive" }[] {
  switch (status) {
    case "active":
      return [
        { label: "Pause", status: "paused", variant: "default" },
        { label: "Cancel", status: "cancelled", variant: "destructive" },
      ]
    case "paused":
      return [
        { label: "Resume", status: "active", variant: "default" },
        { label: "Cancel", status: "cancelled", variant: "destructive" },
      ]
    default:
      return []
  }
}

export default function ChefSubscriptionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const id = params.id as string

  const { data, isLoading } = useQuery({
    queryKey: ["admin-chef-subscription", id],
    queryFn: () => adminGetChefSubscription(id),
    refetchOnWindowFocus: false,
  })

  const statusMutation = useMutation({
    mutationFn: (status: string) => adminUpdateChefSubscriptionStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chef-subscription", id] })
      queryClient.invalidateQueries({ queryKey: ["admin-chef-subscriptions"] })
      toast({ title: "Subscription updated" })
    },
    onError: () => toast({ title: "Failed to update", variant: "destructive" }),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  const sub: SubscriptionDetail | undefined = data?.data

  if (!sub) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Subscription not found</p>
      </div>
    )
  }

  const actions = getActions(sub.status)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold font-mono">{sub.subscription_ref}</h2>
            <Badge className={STATUS_COLORS[sub.status] ?? ""}>{sub.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(sub.created), "PPp")}
          </p>
        </div>
      </div>

      {/* Actions */}
      {actions.length > 0 && (
        <div className="flex gap-2">
          {actions.map((action) => (
            <Button
              key={action.status}
              variant={action.variant}
              onClick={() => statusMutation.mutate(action.status)}
              disabled={statusMutation.isPending}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}

      {/* Subscription + Client */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscription Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Chef:</span> {sub.chef_name}</p>
            <p><span className="text-muted-foreground">Plan:</span> {sub.plan_name}</p>
            <p><span className="text-muted-foreground">Size:</span> {sub.size_variant}</p>
            {sub.dietary_pref && <p><span className="text-muted-foreground">Dietary:</span> {sub.dietary_pref}</p>}
            <p><span className="text-muted-foreground">Delivery Days:</span> {(sub.delivery_days ?? []).join(", ")}</p>
            <p><span className="text-muted-foreground">Delivery Address:</span> {sub.delivery_address}</p>
            <p><span className="text-muted-foreground">Expires:</span> {format(new Date(sub.expires_at), "d MMM yyyy")}</p>
            {sub.paused_at && <p><span className="text-muted-foreground">Paused at:</span> {format(new Date(sub.paused_at), "PPp")}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client & Financials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Client:</span> {sub.client_name}</p>
            {sub.client_email && <p><span className="text-muted-foreground">Email:</span> {sub.client_email}</p>}
            {sub.client_phone && <p><span className="text-muted-foreground">Phone:</span> {sub.client_phone}</p>}
            <hr className="my-3" />
            <p><span className="text-muted-foreground">Plan Price:</span> ${(sub.plan_price / 100).toFixed(2)}</p>
            <p><span className="text-muted-foreground">Add-ons Total:</span> ${(sub.add_ons_total / 100).toFixed(2)}</p>
            <p><span className="text-muted-foreground">Service Fee (4%):</span> ${(sub.service_fee / 100).toFixed(2)}</p>
            <p><span className="text-muted-foreground">Total Paid:</span> <span className="font-semibold">${(sub.total_paid / 100).toFixed(2)}</span></p>
            <p><span className="text-muted-foreground">Commission:</span> {sub.commission_pct}%</p>
            {sub.paynow_ref && <p><span className="text-muted-foreground">Paynow Ref:</span> <span className="font-mono text-xs">{sub.paynow_ref}</span></p>}
          </CardContent>
        </Card>
      </div>

      {/* Add-Ons */}
      {sub.add_ons && sub.add_ons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Add-Ons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {sub.add_ons.map((addon, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{addon.name} x{addon.quantity}</span>
                  <span className="font-medium">${(addon.price / 100).toFixed(2)} each</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
