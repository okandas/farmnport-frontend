"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { format } from "date-fns"
import { ArrowLeft } from "lucide-react"

import { queryTableReservation, updateTableReservationStatus } from "@/lib/query"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
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

const STATUS_STEPS = ["pending", "confirmed", "seated", "completed"] as const

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  seated:    "bg-blue-100 text-blue-800",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-800",
  no_show:   "bg-orange-100 text-orange-800",
}

const STATUS_LABEL: Record<string, string> = {
  pending:   "Awaiting confirmation",
  confirmed: "Confirmed — awaiting arrival",
  seated:    "Guest is seated",
  completed: "Reservation completed",
  cancelled: "Cancelled",
  no_show:   "Guest did not show",
}

interface StatusChange {
  from: string
  to: string
  changed_by: string
  note: string
  timestamp: string
}

interface Reservation {
  id: string
  reservation_ref: string
  full_name: string
  contact: string
  client_email?: string
  restaurant_name: string
  location_name: string
  date: string
  preferred_time: string
  number_of_guests: number
  notes?: string
  status: string
  admin_notes?: string
  status_history?: StatusChange[]
  created: string
  updated: string
}

function getActions(status: string): { label: string; status: string; variant: "default" | "destructive" | "outline" }[] {
  switch (status) {
    case "pending":
      return [
        { label: "Confirm reservation", status: "confirmed", variant: "default" },
        { label: "Cancel", status: "cancelled", variant: "destructive" },
      ]
    case "confirmed":
      return [
        { label: "Mark as seated", status: "seated", variant: "default" },
        { label: "No show", status: "no_show", variant: "outline" },
        { label: "Cancel", status: "cancelled", variant: "destructive" },
      ]
    case "seated":
      return [
        { label: "Mark complete", status: "completed", variant: "default" },
      ]
    default:
      return []
  }
}

export default function ReservationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const id = params.id as string
  const [noteOpen, setNoteOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState("")
  const [adminNote, setAdminNote] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["admin-reservation", id],
    queryFn: () => queryTableReservation(id),
    refetchOnWindowFocus: false,
  })

  const statusMutation = useMutation({
    mutationFn: ({ status, note }: { status: string; note?: string }) =>
      updateTableReservationStatus(id, status, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reservation", id] })
      queryClient.invalidateQueries({ queryKey: ["admin-reservations"] })
      setNoteOpen(false)
      setAdminNote("")
      toast({ title: "Reservation updated" })
    },
    onError: () => toast({ title: "Failed to update reservation", variant: "destructive" }),
  })

  function handleAction(status: string) {
    setPendingStatus(status)
    setNoteOpen(true)
  }

  function confirmAction() {
    statusMutation.mutate({ status: pendingStatus, note: adminNote })
  }

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    )
  }

  const reservation: Reservation | undefined = data?.data?.reservation ?? data?.data

  if (!reservation) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Reservation not found</p>
      </div>
    )
  }

  const currentStepIndex = STATUS_STEPS.indexOf(reservation.status as typeof STATUS_STEPS[number])
  const isTerminal = ["cancelled", "no_show"].includes(reservation.status)
  const actions = getActions(reservation.status)
  const progressPct = currentStepIndex >= 0
    ? Math.round((currentStepIndex / (STATUS_STEPS.length - 1)) * 100)
    : 0

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="-ml-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-mono tracking-tight">{reservation.reservation_ref}</h1>
            <Badge className={STATUS_COLORS[reservation.status] ?? ""}>
              <span className="capitalize">{reservation.status.replace("_", " ")}</span>
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Submitted {format(new Date(reservation.created), "d MMM yyyy, HH:mm")}
          </p>
        </div>
      </div>

      {/* Main panel — info top, progress + actions bottom */}
      <div className="border border-border rounded-lg bg-card shadow-sm overflow-hidden">
        <div className="px-6 py-6 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          {/* Guest */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Guest</p>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Name</dt>
                <dd className="font-medium">{reservation.full_name}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Phone</dt>
                <dd>{reservation.contact}</dd>
              </div>
              {reservation.client_email && (
                <div>
                  <dt className="text-xs text-muted-foreground">Email</dt>
                  <dd>{reservation.client_email}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Booking */}
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Booking</p>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Restaurant</dt>
                <dd className="capitalize">{reservation.restaurant_name}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Location</dt>
                <dd className="capitalize">{reservation.location_name}</dd>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-muted-foreground">Date</dt>
                  <dd>{reservation.date}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Time</dt>
                  <dd>{reservation.preferred_time}</dd>
                </div>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Guests</dt>
                <dd>{reservation.number_of_guests}</dd>
              </div>
              {reservation.notes && (
                <div>
                  <dt className="text-xs text-muted-foreground">Guest notes</dt>
                  <dd className="italic text-muted-foreground">{reservation.notes}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Status + progress bar + actions */}
        <div className="border-t border-border px-6 py-6">
          <p className="text-sm font-medium">{STATUS_LABEL[reservation.status] ?? reservation.status}</p>

          {!isTerminal && (
            <div className="mt-4">
              <div className="overflow-hidden rounded-full bg-muted h-2">
                <div
                  className="h-2 rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div
                className="mt-3 grid text-xs font-medium text-muted-foreground"
                style={{ gridTemplateColumns: `repeat(${STATUS_STEPS.length}, minmax(0, 1fr))` }}
              >
                {STATUS_STEPS.map((step, i) => (
                  <span
                    key={step}
                    className={`capitalize ${i === 0 ? "text-left" : i === STATUS_STEPS.length - 1 ? "text-right" : "text-center"} ${i <= currentStepIndex ? "text-foreground" : ""}`}
                  >
                    {step}
                  </span>
                ))}
              </div>
            </div>
          )}

          {actions.length > 0 && (
            <div className="mt-5 flex gap-2 flex-wrap">
              {actions.map((action) => (
                <Button
                  key={action.status}
                  variant={action.variant}
                  size="sm"
                  onClick={() => handleAction(action.status)}
                  disabled={statusMutation.isPending}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Admin notes */}
      {reservation.admin_notes && (
        <div className="text-sm">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Admin notes</p>
          <p className="text-muted-foreground italic">{reservation.admin_notes}</p>
        </div>
      )}

      {/* Status Timeline */}
      {reservation.status_history && reservation.status_history.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Timeline</p>
          <div className="space-y-4">
            {reservation.status_history.map((change, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                  {i < reservation.status_history!.length - 1 && (
                    <div className="w-px flex-1 bg-border mt-1" />
                  )}
                </div>
                <div className="pb-4 text-sm">
                  <p className="font-medium capitalize">{change.to.replace("_", " ")}</p>
                  <p className="text-xs text-muted-foreground">
                    {change.changed_by} &middot; {format(new Date(change.timestamp), "d MMM yyyy, HH:mm")}
                  </p>
                  {change.note && (
                    <p className="text-xs text-muted-foreground mt-0.5 italic">{change.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status action dialog */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">
              {pendingStatus.replace("_", " ")} reservation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Note <span className="text-muted-foreground text-xs">(optional — sent to guest)</span></Label>
              <Textarea
                placeholder="e.g. Your table is confirmed, please arrive 10 minutes early."
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteOpen(false)}>Cancel</Button>
            <Button disabled={statusMutation.isPending} onClick={confirmAction}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
