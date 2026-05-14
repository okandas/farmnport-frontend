"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { ArrowLeft, Package, Truck, UtensilsCrossed, CheckCircle2, XCircle, Clock } from "lucide-react"
import { queryMenusOrder, updateMenusOrderStatus } from "@/lib/query"
import { DashboardShell } from "@/components/state/dashboardShell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

const STATUS_COLORS: Record<string, string> = {
  pending:          "bg-yellow-100 text-yellow-800",
  confirmed:        "bg-blue-100 text-blue-800",
  preparing:        "bg-purple-100 text-purple-800",
  ready:            "bg-teal-100 text-teal-800",
  out_for_delivery: "bg-indigo-100 text-indigo-800",
  delivered:        "bg-green-100 text-green-800",
  completed:        "bg-green-100 text-green-800",
  cancelled:        "bg-red-100 text-red-800",
}

const PICKUP_STEPS = ["pending", "confirmed", "preparing", "ready", "completed"]
const DELIVERY_STEPS = ["pending", "confirmed", "preparing", "out_for_delivery", "delivered"]
const DINE_IN_STEPS = ["pending", "confirmed", "preparing", "completed"]

const TYPE_ICONS: Record<string, React.ReactNode> = {
  pickup:   <Package className="h-4 w-4" />,
  delivery: <Truck className="h-4 w-4" />,
  dine_in:  <UtensilsCrossed className="h-4 w-4" />,
}

function getNextActions(status: string, type: string) {
  const actions: { label: string; status: string; variant: "default" | "destructive" }[] = []
  switch (status) {
    case "pending":
      actions.push({ label: "Confirm Order", status: "confirmed", variant: "default" })
      break
    case "confirmed":
      actions.push({ label: "Start Preparing", status: "preparing", variant: "default" })
      break
    case "preparing":
      if (type === "delivery") {
        actions.push({ label: "Out for Delivery", status: "out_for_delivery", variant: "default" })
      } else {
        actions.push({ label: "Mark Ready", status: "ready", variant: "default" })
      }
      break
    case "ready":
      actions.push({ label: "Mark Completed", status: "completed", variant: "default" })
      break
    case "out_for_delivery":
      actions.push({ label: "Mark Delivered", status: "delivered", variant: "default" })
      break
  }
  if (!["completed", "delivered", "cancelled"].includes(status)) {
    actions.push({ label: "Cancel Order", status: "cancelled", variant: "destructive" })
  }
  return actions
}

export default function MenusOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const qc = useQueryClient()
  const { toast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ["menus-order", id],
    queryFn: () => queryMenusOrder(id),
    refetchOnWindowFocus: false,
  })

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateMenusOrderStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menus-order", id] })
      qc.invalidateQueries({ queryKey: ["menus-orders"] })
      qc.invalidateQueries({ queryKey: ["notifications"] })
      toast({ title: "Order status updated" })
    },
    onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
  })

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="space-y-4">
          {[1,2,3].map(n => <div key={n} className="h-32 rounded-lg bg-muted animate-pulse" />)}
        </div>
      </DashboardShell>
    )
  }

  const order = data?.data
  if (!order) {
    return (
      <DashboardShell>
        <p className="text-muted-foreground">Order not found</p>
      </DashboardShell>
    )
  }

  const steps = order.type === "delivery" ? DELIVERY_STEPS
    : order.type === "dine_in" ? DINE_IN_STEPS
    : PICKUP_STEPS
  const currentStep = steps.indexOf(order.status)
  const actions = getNextActions(order.status, order.type)

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold font-mono">{order.order_ref}</h2>
            <Badge className={STATUS_COLORS[order.status] ?? ""} variant="outline">
              {order.status}
            </Badge>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              {TYPE_ICONS[order.type]}
              {order.type === "pickup" ? "Pickup" : order.type === "delivery" ? "Delivery" : "Dine-in"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 capitalize">
            {order.restaurant_name} — {order.location_name}
          </p>
          <p className="text-xs text-muted-foreground">{format(new Date(order.created), "PPp")}</p>
        </div>
      </div>

      {/* Status stepper */}
      {order.status !== "cancelled" && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {steps.map((step, i) => {
                const done = i <= currentStep
                const current = i === currentStep
                return (
                  <div key={step} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-medium ${done ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 text-muted-foreground/30"} ${current ? "ring-2 ring-primary/20" : ""}`}>
                        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                      </div>
                      <span className={`text-[11px] capitalize ${done ? "font-medium" : "text-muted-foreground/50"}`}>
                        {step.replace("_", " ")}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`mx-1 h-0.5 flex-1 ${i < currentStep ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      {actions.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {actions.map((a) => (
            <Button
              key={a.status}
              variant={a.variant}
              onClick={() => statusMutation.mutate(a.status)}
              disabled={statusMutation.isPending}
            >
              {a.label}
            </Button>
          ))}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer */}
        <Card>
          <CardHeader><CardTitle className="text-base">Customer</CardTitle></CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <p><span className="text-muted-foreground">Name:</span> {order.full_name}</p>
            <p><span className="text-muted-foreground">Contact:</span> {order.contact}</p>
          </CardContent>
        </Card>

        {/* Fulfillment */}
        <Card>
          <CardHeader><CardTitle className="text-base">Fulfillment</CardTitle></CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <p><span className="text-muted-foreground">Type:</span> {order.type === "pickup" ? "Pickup" : order.type === "delivery" ? "Delivery" : "Dine-in"}</p>
            {(order.pickup_date || order.arrival_date) && (
              <p><span className="text-muted-foreground">Date/Time:</span> {order.pickup_date || order.arrival_date} at {order.pickup_time || order.arrival_time}</p>
            )}
            {order.delivery_address && (
              <p><span className="text-muted-foreground">Address:</span> {order.delivery_address}, {order.delivery_city}</p>
            )}
            {order.number_of_guests && (
              <p><span className="text-muted-foreground">Guests:</span> {order.number_of_guests}</p>
            )}
            {order.notes && (
              <p><span className="text-muted-foreground">Notes:</span> {order.notes}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader><CardTitle className="text-base">Items</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(order.items ?? []).map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                <div>
                  <p className="font-medium capitalize">{item.menu_item_name}{item.size_name ? ` (${item.size_name})` : ""}</p>
                  {item.notes && <p className="text-xs text-muted-foreground">{item.notes}</p>}
                  <p className="text-xs text-muted-foreground">{item.quantity} × ${((item.unit_price ?? 0) / 100).toFixed(2)}</p>
                </div>
                <span className="font-medium">${((item.line_total ?? item.unit_price * item.quantity ?? 0) / 100).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${((order.total ?? 0) / 100).toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Status history */}
      {order.status_history?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Timeline</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {order.status_history.map((h: any, i: number) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                    {i < order.status_history.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-sm font-medium capitalize">{h.to}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(h.timestamp), "PPp")}</p>
                    {h.admin_notes && <p className="text-xs text-muted-foreground mt-0.5 italic">{h.admin_notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </DashboardShell>
  )
}
