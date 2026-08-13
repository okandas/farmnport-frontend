"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { ArrowLeft } from "lucide-react"

import { adminGetChefBooking, adminUpdateChefBookingStatus } from "@/lib/query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "bg-gray-100 text-gray-700",
  paid:            "bg-blue-100 text-blue-800",
  confirmed:       "bg-green-100 text-green-800",
  declined:        "bg-red-100 text-red-800",
  completed:       "bg-gray-100 text-gray-700",
  cancelled:       "bg-red-100 text-red-800",
  refunded:        "bg-orange-100 text-orange-800",
}

interface BookingDetail {
  id: string
  booking_ref: string
  chef_id: string
  chef_name: string
  listing_id: string
  listing_title: string
  type: string
  client_id: string
  client_name: string
  client_email?: string
  client_phone?: string
  event_date: string
  event_time?: string
  location?: string
  guest_count: number
  notes?: string
  gross_amount: number
  service_fee: number
  total_paid: number
  commission_pct: number
  commission_amount: number
  paynow_ref?: string
  status: string
  admin_notes?: string
  confirm_deadline?: string
  dispute_deadline?: string
  created: string
  updated: string
}

function getActions(status: string): { label: string; status: string; variant: "default" | "destructive" }[] {
  switch (status) {
    case "paid":
      return [
        { label: "Confirm", status: "confirmed", variant: "default" },
        { label: "Decline", status: "declined", variant: "destructive" },
      ]
    case "confirmed":
      return [
        { label: "Mark Completed", status: "completed", variant: "default" },
        { label: "Cancel", status: "cancelled", variant: "destructive" },
      ]
    default:
      return []
  }
}

export default function ChefBookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const id = params.id as string

  const { data, isLoading } = useQuery({
    queryKey: ["admin-chef-booking", id],
    queryFn: () => adminGetChefBooking(id),
    refetchOnWindowFocus: false,
  })

  const statusMutation = useMutation({
    mutationFn: (status: string) => adminUpdateChefBookingStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chef-booking", id] })
      queryClient.invalidateQueries({ queryKey: ["admin-chef-bookings"] })
      toast({ title: "Booking updated" })
    },
    onError: () => toast({ title: "Failed to update booking", variant: "destructive" }),
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

  const booking: BookingDetail | undefined = data?.data

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Booking not found</p>
      </div>
    )
  }

  const actions = getActions(booking.status)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold font-mono">{booking.booking_ref}</h2>
            <Badge className={STATUS_COLORS[booking.status] ?? ""}>
              {booking.status.replace("_", " ")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(booking.created), "PPp")}
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

      {/* Details */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Chef:</span> {booking.chef_name}</p>
            <p><span className="text-muted-foreground">Listing:</span> {booking.listing_title}</p>
            <p><span className="text-muted-foreground">Type:</span> <span className="capitalize">{booking.type}</span></p>
            <p><span className="text-muted-foreground">Event Date:</span> {booking.event_date}</p>
            {booking.event_time && <p><span className="text-muted-foreground">Event Time:</span> {booking.event_time}</p>}
            {booking.location && <p><span className="text-muted-foreground">Location:</span> {booking.location}</p>}
            <p><span className="text-muted-foreground">Guests:</span> {booking.guest_count}</p>
            {booking.notes && <p><span className="text-muted-foreground">Notes:</span> <span className="italic">{booking.notes}</span></p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client & Financials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Client:</span> {booking.client_name}</p>
            {booking.client_email && <p><span className="text-muted-foreground">Email:</span> {booking.client_email}</p>}
            {booking.client_phone && <p><span className="text-muted-foreground">Phone:</span> {booking.client_phone}</p>}
            <hr className="my-3" />
            <p><span className="text-muted-foreground">Gross:</span> ${(booking.gross_amount / 100).toFixed(2)}</p>
            <p><span className="text-muted-foreground">Service Fee (4%):</span> ${(booking.service_fee / 100).toFixed(2)}</p>
            <p><span className="text-muted-foreground">Total Paid:</span> <span className="font-semibold">${(booking.total_paid / 100).toFixed(2)}</span></p>
            <p><span className="text-muted-foreground">Commission ({booking.commission_pct}%):</span> ${(booking.commission_amount / 100).toFixed(2)}</p>
            {booking.paynow_ref && <p><span className="text-muted-foreground">Paynow Ref:</span> <span className="font-mono text-xs">{booking.paynow_ref}</span></p>}
          </CardContent>
        </Card>
      </div>

      {/* Deadlines */}
      {(booking.confirm_deadline || booking.dispute_deadline) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {booking.confirm_deadline && (
              <p><span className="text-muted-foreground">Confirm by:</span> {format(new Date(booking.confirm_deadline), "PPp")}</p>
            )}
            {booking.dispute_deadline && (
              <p><span className="text-muted-foreground">Dispute window closes:</span> {format(new Date(booking.dispute_deadline), "PPp")}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admin Notes */}
      {booking.admin_notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admin Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground italic">{booking.admin_notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
