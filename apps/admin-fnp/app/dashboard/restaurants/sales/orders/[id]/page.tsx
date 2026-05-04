"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { useState, useEffect } from "react"
import Cookies from "js-cookie"
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Copy,
} from "lucide-react"

import { queryOrder, updateOrderStatus } from "@/lib/query"
import { CLIENT_URL } from "@/lib/config"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const STATUS_STEPS = ["pending", "paid", "processing", "dispatched", "delivered"]
const STATUS_STEPS_COLLECT = ["pending", "paid", "processing", "ready", "delivered"]

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  dispatched: "bg-indigo-100 text-indigo-800",
  ready: "bg-teal-100 text-teal-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  paid: <CreditCard className="h-4 w-4" />,
  processing: <Package className="h-4 w-4" />,
  dispatched: <Truck className="h-4 w-4" />,
  ready: <CheckCircle2 className="h-4 w-4" />,
  delivered: <CheckCircle2 className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
}

interface OrderItem {
  product_name: string
  quantity: number
  unit_price: number
  line_total: number
}

interface StatusChange {
  from: string
  to: string
  changed_by: string
  note: string
  timestamp: string
}

interface DeliveryAddress {
  name: string
  phone: string
  address: string
  city: string
  province: string
}

interface Order {
  id: string
  order_number: string
  client_name: string
  client_first_name: string
  client_last_name: string
  client_email: string
  client_phone: string
  order_type: string
  status: string
  items: OrderItem[]
  subtotal: number
  delivery_fee: number
  total: number
  currency: string
  fulfillment: string
  delivery_address?: DeliveryAddress
  payment_provider: string
  payment_method: string
  payment_ref: string
  paid_at?: string
  verify_token: string
  status_history: StatusChange[]
  delivered_at?: string
  created: string
  updated: string
}

function getNextActions(
  status: string,
  fulfillment: string
): { label: string; status: string; variant: "default" | "destructive" }[] {
  const actions: { label: string; status: string; variant: "default" | "destructive" }[] = []

  switch (status) {
    case "paid":
      actions.push({ label: "Acknowledge Order", status: "processing", variant: "default" })
      break
    case "processing":
      if (fulfillment === "click_collect") {
        actions.push({ label: "Ready for Pickup", status: "ready", variant: "default" })
      } else {
        actions.push({ label: "Mark Dispatched", status: "dispatched", variant: "default" })
      }
      break
    case "dispatched":
    case "ready":
      actions.push({ label: "Mark Delivered", status: "delivered", variant: "default" })
      break
  }

  if (status !== "delivered" && status !== "cancelled") {
    actions.push({ label: "Cancel Order", status: "cancelled", variant: "destructive" })
  }

  return actions
}

export default function RestaurantOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const orderId = params.id as string

  const [markPaidOpen, setMarkPaidOpen] = useState(false)
  const [adminEmail, setAdminEmail] = useState("")
  const [paidNote, setPaidNote] = useState("")

  useEffect(() => {
    try {
      const token = Cookies.get("cl_jtkn")
      if (token) {
        const payload = JSON.parse(atob(token.split(".")[1]))
        setAdminEmail(payload.email || payload.sub || "admin")
      }
    } catch {}
  }, [])

  const { data, isLoading } = useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: () => queryOrder(orderId),
    refetchOnWindowFocus: false,
  })

  const markPaidMutation = useMutation({
    mutationFn: () =>
      updateOrderStatus({
        order_id: orderId,
        status: "paid",
        note: `Manual payment approval. Approved by: ${adminEmail}${paidNote ? `. ${paidNote}` : ""}`,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", orderId] })
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] })
      setMarkPaidOpen(false)
      setPaidNote("")
      toast({ title: "Order marked as paid" })
    },
    onError: () => {
      toast({ title: "Failed to mark as paid", variant: "destructive" })
    },
  })

  const statusMutation = useMutation({
    mutationFn: (newStatus: string) =>
      updateOrderStatus({ order_id: orderId, status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", orderId] })
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] })
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
      toast({ title: "Order status updated" })
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" })
    },
  })

  const order: Order | undefined = data?.data

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

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Order not found</p>
      </div>
    )
  }

  const steps =
    order.fulfillment === "click_collect" ? STATUS_STEPS_COLLECT : STATUS_STEPS
  const currentStepIndex = steps.indexOf(order.status)
  const actions = getNextActions(order.status, order.fulfillment)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{order.order_number}</h2>
            <Badge className={STATUS_COLORS[order.status] ?? ""}>
              {order.status}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(order.created), "PPp")}
          </p>
        </div>
      </div>

      {/* Status Stepper */}
      {order.status !== "cancelled" && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {steps.map((step, i) => {
                const isCompleted = i <= currentStepIndex
                const isCurrent = i === currentStepIndex
                return (
                  <div key={step} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                          isCompleted
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30 text-muted-foreground/30"
                        } ${isCurrent ? "ring-2 ring-primary/20" : ""}`}
                      >
                        {STATUS_ICONS[step]}
                      </div>
                      <span
                        className={`text-xs capitalize ${
                          isCompleted ? "font-medium text-foreground" : "text-muted-foreground/50"
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`mx-2 h-0.5 flex-1 ${i < currentStepIndex ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <div className="flex gap-2">
          {actions
            .filter((action) => action.status !== "cancelled")
            .map((action) => (
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

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Name:</span> {order.client_first_name} {order.client_last_name}</p>
            <p><span className="text-muted-foreground">Email:</span> {order.client_email}</p>
            <p><span className="text-muted-foreground">Phone:</span> {order.client_phone}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Provider:</span> <span className="capitalize">{order.payment_provider}</span></p>
            <p><span className="text-muted-foreground">Reference:</span> {order.payment_ref}</p>
            {order.paid_at && (
              <p><span className="text-muted-foreground">Paid at:</span> {format(new Date(order.paid_at), "PPp")}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Fulfillment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Method:</span>{" "}
              {order.fulfillment === "click_collect" ? "Click & Collect" : "Delivery"}
            </p>
            {order.delivery_address && (
              <p><span className="text-muted-foreground">Address:</span> {order.delivery_address.address}, {order.delivery_address.city}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">QR Verification</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <div className="flex items-center gap-2">
              <code className="flex-1 block rounded bg-muted p-2 text-xs break-all">
                {CLIENT_URL}/order/verify/{order.id}/{order.verify_token}
              </code>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => navigator.clipboard.writeText(`${CLIENT_URL}/order/verify/${order.id}/${order.verify_token}`)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">{item.quantity} x ${(item.unit_price / 100).toFixed(2)}</p>
                </div>
                <span className="text-sm font-medium">${(item.line_total / 100).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <div className="space-y-1 text-sm">
            <div className="flex justify-between font-medium text-base">
              <span>Total</span>
              <span>${(order.total / 100).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      {order.status_history && order.status_history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.status_history.map((change, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    {i < order.status_history.length - 1 && <div className="w-px flex-1 bg-border" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium capitalize">{change.to}</p>
                    <p className="text-xs text-muted-foreground">
                      {change.changed_by} &middot; {format(new Date(change.timestamp), "PPp")}
                    </p>
                    {change.note && <p className="text-xs text-muted-foreground mt-1">{change.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual payment approval */}
      {order.status === "pending" && (
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={() => setMarkPaidOpen(true)}>Mark as Paid</Button>
          <Button
            variant="destructive"
            onClick={() => statusMutation.mutate("cancelled")}
            disabled={statusMutation.isPending}
          >
            Cancel Order
          </Button>
        </div>
      )}

      {/* Cancel for non-pending, non-terminal */}
      {order.status !== "pending" && order.status !== "delivered" && order.status !== "cancelled" && (
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="destructive"
            onClick={() => statusMutation.mutate("cancelled")}
            disabled={statusMutation.isPending}
          >
            Cancel Order
          </Button>
        </div>
      )}

      {/* Mark as Paid dialog */}
      <Dialog open={markPaidOpen} onOpenChange={setMarkPaidOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark Order as Paid</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              Approving as <span className="font-medium text-foreground">{adminEmail}</span>
            </p>
            <div className="space-y-1.5">
              <Label>Note <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Textarea
                placeholder="Payment reference, channel, or any relevant detail"
                value={paidNote}
                onChange={(e) => setPaidNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkPaidOpen(false)}>Cancel</Button>
            <Button
              disabled={markPaidMutation.isPending}
              onClick={() => markPaidMutation.mutate()}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
