"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { format } from "date-fns"
import {
  ArrowLeft,
  CalendarCheck,
  Clock,
  CheckCircle2,
  XCircle,
  UserX,
  Armchair,
} from "lucide-react"

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

const STATUS_STEPS = ["pending", "confirmed", "seated", "completed"]

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  seated:    "bg-blue-100 text-blue-800",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-800",
  no_show:   "bg-orange-100 text-orange-800",
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending:   <Clock className="h-4 w-4" />,
  confirmed: <CalendarCheck className="h-4 w-4" />,
  seated:    <Armchair className="h-4 w-4" />,
  completed: <CheckCircle2 className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
  no_show:   <UserX className="h-4 w-4" />,
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
  created: string
  updated: string
}

function getActions(status: string): { label: string; status: string; variant: "default" | "destructive" | "outline" }[] {
  switch (status) {
    case "pending":
      return [
        { label: "Confirm", status: "confirmed", variant: "default" },
        { label: "Cancel", status: "cancelled", variant: "destructive" },
      ]
    case "confirmed":
      return [
        { label: "Mark Seated", status: "seated", variant: "default" },
        { label: "No Show", status: "no_show", variant: "outline" },
        { label: "Cancel", status: "cancelled", variant: "destructive" },
      ]
    case "seated":
      return [
        { label: "Complete", status: "completed", variant: "default" },
      ]
    default:
      return []
  }
}

function InfoRow({ label, value }: { label: string; value?: React.ReactNode }) {
  if (!value) return null
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">{value}</span>
    </div>
  )
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
      <div className="flex flex-col gap-6 max-w-2xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-40 w-full" />
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

  const currentStepIndex = STATUS_STEPS.indexOf(reservation.status)
  const actions = getActions(reservation.status)

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" className="-ml-2 mt-0.5" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold font-mono">{reservation.reservation_ref}</h2>
            <Badge className={STATUS_COLORS[reservation.status] ?? ""}>
              {STATUS_ICONS[reservation.status]}
              <span className="ml-1 capitalize">{reservation.status.replace("_", " ")}</span>
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Submitted {format(new Date(reservation.created), "d MMM yyyy, HH:mm")}
          </p>
        </div>
      </div>

      {/* Status Stepper */}
      {!["cancelled", "no_show"].includes(reservation.status) && (
        <div className="flex items-center">
          {STATUS_STEPS.map((step, i) => {
            const isCompleted = i <= currentStepIndex
            const isCurrent = i === currentStepIndex
            return (
              <div key={step} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${isCompleted ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 text-muted-foreground/30"} ${isCurrent ? "ring-2 ring-primary/20" : ""}`}>
                    {STATUS_ICONS[step]}
                  </div>
                  <span className={`text-xs capitalize ${isCompleted ? "font-medium text-foreground" : "text-muted-foreground/50"}`}>
                    {step}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`mx-2 h-0.5 flex-1 ${i < currentStepIndex ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Actions */}
      {actions.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {actions.map((action) => (
            <Button
              key={action.status}
              variant={action.variant}
              onClick={() => handleAction(action.status)}
              disabled={statusMutation.isPending}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}

      {/* Guest */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Guest</p>
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Name" value={reservation.full_name} />
          <InfoRow label="Phone" value={reservation.contact} />
          {reservation.client_email && (
            <InfoRow label="Email" value={reservation.client_email} />
          )}
        </div>
      </div>

      <div className="border-t" />

      {/* Booking */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Booking</p>
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Restaurant" value={<span className="capitalize">{reservation.restaurant_name}</span>} />
          <InfoRow label="Location" value={<span className="capitalize">{reservation.location_name}</span>} />
          <InfoRow label="Date" value={reservation.date} />
          <InfoRow label="Time" value={reservation.preferred_time} />
          <InfoRow label="Guests" value={String(reservation.number_of_guests)} />
          {reservation.notes && (
            <div className="col-span-2">
              <InfoRow label="Guest Notes" value={<span className="italic">{reservation.notes}</span>} />
            </div>
          )}
        </div>
      </div>

      {/* Admin notes */}
      {reservation.admin_notes && (
        <>
          <div className="border-t" />
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Admin Notes</p>
            <p className="text-sm text-muted-foreground italic">{reservation.admin_notes}</p>
          </div>
        </>
      )}

      {/* Status action dialog */}
      <Dialog open={noteOpen} onOpenChange={setNoteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="capitalize">
              {pendingStatus.replace("_", " ")} Reservation
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
