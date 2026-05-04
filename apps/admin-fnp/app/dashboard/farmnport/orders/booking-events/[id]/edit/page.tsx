"use client"

import { use, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import Link from "next/link"

import { queryAdminBookingEvents, updateBookingEvent } from "@/lib/query"
import { toast } from "@/components/ui/use-toast"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { Placeholder } from "@/components/state/placeholder"
import { ClientCombobox } from "@/components/structures/client-combobox"

function toInputDate(iso: string) {
  if (!iso) return ""
  return new Date(iso).toISOString().slice(0, 16)
}

export default function EditBookingEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-booking-events"],
    queryFn: () => queryAdminBookingEvents(),
    refetchOnWindowFocus: false,
  })

  const events: any[] = data?.data?.events ?? []
  const event = events.find((e: any) => e.id === id)

  const [form, setForm] = useState<{
    title: string
    description: string
    status: string
    total_available: string
    unit_price: string
    deposit_per_unit: string
    open_date: string
    close_date: string
    image_src: string
    client_id: string
    client_name: string
  } | null>(null)

  // Initialise form once event is loaded
  if (event && form === null) {
    setForm({
      title: event.title ?? "",
      description: event.description ?? "",
      status: event.status ?? "draft",
      total_available: String(event.total_available ?? ""),
      unit_price: ((event.unit_price ?? 0) / 100).toFixed(2),
      deposit_per_unit: ((event.deposit_per_unit ?? 0) / 100).toFixed(2),
      open_date: toInputDate(event.open_date),
      close_date: toInputDate(event.close_date),
      image_src: event.image_src ?? "",
      client_id: event.client_id ?? "",
      client_name: event.client_name ?? "",
    })
  }

  const mutation = useMutation({
    mutationFn: () =>
      updateBookingEvent(id, {
        title: form!.title,
        description: form!.description || undefined,
        status: form!.status,
        total_available: parseInt(form!.total_available),
        unit_price: Math.round(parseFloat(form!.unit_price) * 100),
        deposit_per_unit: Math.round(parseFloat(form!.deposit_per_unit) * 100),
        open_date: new Date(form!.open_date).toISOString(),
        close_date: new Date(form!.close_date).toISOString(),
        image_src: form!.image_src || undefined,
        client_id: form!.client_id || undefined,
        client_name: form!.client_name || undefined,
      }),
    onSuccess: () => {
      toast({ description: "Event updated" })
      queryClient.invalidateQueries({ queryKey: ["admin-booking-events"] })
      router.push("/dashboard/farmnport/orders/booking-events")
    },
    onError: () => toast({ description: "Failed to update event", variant: "destructive" }),
  })

  function set(field: string, value: string) {
    setForm((f) => f ? { ...f, [field]: value } : f)
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <Placeholder><Placeholder.Title>Loading</Placeholder.Title></Placeholder>
      </DashboardShell>
    )
  }

  if (isError || (!isLoading && !event)) {
    return (
      <DashboardShell>
        <Placeholder>
          <Placeholder.Icon name="close" />
          <Placeholder.Title>Event not found</Placeholder.Title>
        </Placeholder>
      </DashboardShell>
    )
  }

  if (!form) return null

  return (
    <DashboardShell>
      <DashboardHeader heading="Edit Booking Event" text={event?.title ?? ""} />

      <div className="max-w-2xl space-y-6">

        <div className="border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm">Event Details</h2>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Title *</label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              className="w-full text-sm border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring bg-background"
              >
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Image URL</label>
              <input
                value={form.image_src}
                onChange={(e) => set("image_src", e.target.value)}
                placeholder="https://..."
                className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        <div className="border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm">Supplier</h2>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Client (Supplier) *</label>
            <ClientCombobox
              value={form.client_id}
              onChange={(s) => setForm((f) => f ? { ...f, client_id: s.id, client_name: s.name } : f)}
            />
          </div>
        </div>

        <div className="border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm">Pricing & Capacity</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Unit Price ($) *</label>
              <input
                type="number" step="0.01" min="0"
                value={form.unit_price}
                onChange={(e) => set("unit_price", e.target.value)}
                className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Deposit per Unit ($) *</label>
              <input
                type="number" step="0.01" min="0"
                value={form.deposit_per_unit}
                onChange={(e) => set("deposit_per_unit", e.target.value)}
                className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Total Available *</label>
              <input
                type="number" min="1"
                value={form.total_available}
                onChange={(e) => set("total_available", e.target.value)}
                className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        <div className="border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm">Booking Window</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Opens *</label>
              <input
                type="datetime-local"
                value={form.open_date}
                onChange={(e) => set("open_date", e.target.value)}
                className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Closes *</label>
              <input
                type="datetime-local"
                value={form.close_date}
                onChange={(e) => set("close_date", e.target.value)}
                className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.title || !form.unit_price || !form.total_available}
            className="flex items-center gap-2 bg-primary text-primary-foreground font-medium px-5 py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
          >
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
          <Link
            href="/dashboard/farmnport/orders/booking-events"
            className="px-5 py-2.5 rounded-xl border text-sm font-medium hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
        </div>
      </div>
    </DashboardShell>
  )
}
