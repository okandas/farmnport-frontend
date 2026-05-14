"use client"

import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { ArrowLeft, CheckCircle2, Clock, Users, Calendar } from "lucide-react"
import { queryMenusReservation, updateMenusReservationStatus } from "@/lib/query"
import { DashboardShell } from "@/components/state/dashboardShell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  seated:    "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  no_show:   "bg-zinc-100 text-zinc-700",
}

const STEPS = ["pending", "confirmed", "seated", "completed"]

function getNextActions(status: string) {
  const actions: { label: string; status: string; variant: "default" | "destructive" | "outline" }[] = []
  switch (status) {
    case "pending":
      actions.push({ label: "Confirm Reservation", status: "confirmed", variant: "default" })
      break
    case "confirmed":
      actions.push({ label: "Mark Seated", status: "seated", variant: "default" })
      break
    case "seated":
      actions.push({ label: "Mark Completed", status: "completed", variant: "default" })
      break
  }
  if (!["completed", "cancelled", "no_show"].includes(status)) {
    actions.push({ label: "Mark No-show", status: "no_show", variant: "outline" })
    actions.push({ label: "Cancel", status: "cancelled", variant: "destructive" })
  }
  return actions
}

export default function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const qc = useQueryClient()
  const { toast } = useToast()

  const { data, isLoading } = useQuery({
    queryKey: ["menus-reservation", id],
    queryFn: () => queryMenusReservation(id),
    refetchOnWindowFocus: false,
  })

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateMenusReservationStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["menus-reservation", id] })
      qc.invalidateQueries({ queryKey: ["menus-reservations"] })
      qc.invalidateQueries({ queryKey: ["notifications"] })
      toast({ title: "Reservation updated" })
    },
    onError: () => toast({ title: "Failed to update reservation", variant: "destructive" }),
  })

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="space-y-4">
          {[1,2].map(n => <div key={n} className="h-32 rounded-lg bg-muted animate-pulse" />)}
        </div>
      </DashboardShell>
    )
  }

  const r = data?.data
  if (!r) {
    return (
      <DashboardShell>
        <p className="text-muted-foreground">Reservation not found</p>
      </DashboardShell>
    )
  }

  const currentStep = STEPS.indexOf(r.status)
  const actions = getNextActions(r.status)

  return (
    <DashboardShell>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl font-bold font-mono">{r.reservation_ref}</h2>
            <Badge className={STATUS_COLORS[r.status] ?? ""} variant="outline">{r.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground capitalize">{r.restaurant_name} — {r.location_name}</p>
          <p className="text-xs text-muted-foreground">{format(new Date(r.created), "PPp")}</p>
        </div>
      </div>

      {/* Status stepper */}
      {!["cancelled", "no_show"].includes(r.status) && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              {STEPS.map((step, i) => {
                const done = i <= currentStep
                const current = i === currentStep
                return (
                  <div key={step} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`flex h-7 w-7 items-center justify-center rounded-full border-2 ${done ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30 text-muted-foreground/30"} ${current ? "ring-2 ring-primary/20" : ""}`}>
                        {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                      </div>
                      <span className={`text-[11px] capitalize ${done ? "font-medium" : "text-muted-foreground/50"}`}>{step}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`mx-1 h-0.5 flex-1 ${i < currentStep ? "bg-primary" : "bg-muted"}`} />
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
        {/* Guest */}
        <Card>
          <CardHeader><CardTitle className="text-base">Guest</CardTitle></CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <p><span className="text-muted-foreground">Name:</span> {r.full_name}</p>
            <p><span className="text-muted-foreground">Contact:</span> {r.contact}</p>
          </CardContent>
        </Card>

        {/* Booking details */}
        <Card>
          <CardHeader><CardTitle className="text-base">Booking Details</CardTitle></CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <p className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {r.date} at {r.preferred_time}
            </p>
            <p className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              {r.number_of_guests} {r.number_of_guests === 1 ? "guest" : "guests"}
            </p>
            {r.notes && (
              <p className="text-muted-foreground italic mt-2">{r.notes}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      {r.status_history?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Timeline</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {r.status_history.map((h: any, i: number) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                    {i < r.status_history.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
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
