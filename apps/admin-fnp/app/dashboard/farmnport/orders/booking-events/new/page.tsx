"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

import { createBookingEvent } from "@/lib/query"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { ProductCombobox, ProductType } from "@/components/structures/product-combobox"

export default function NewBookingEventPage() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    title: "",
    description: "",
    product_id: "",
    product_name: "",
    product_slug: "",
    product_type: "animal_health",
    unit_price: "",        // display as dollars, send as cents
    deposit_per_unit: "",  // display as dollars, send as cents
    min_quantity: "",
    max_quantity: "",
    total_available: "",
    open_date: "",
    close_date: "",
    status: "draft",
    image_src: "",
  })

  const mutation = useMutation({
    mutationFn: () =>
      createBookingEvent({
        title: form.title,
        description: form.description || undefined,
        product_id: form.product_id,
        product_name: form.product_name,
        product_slug: form.product_slug,
        product_type: form.product_type,
        unit_price: Math.round(parseFloat(form.unit_price) * 100),
        deposit_per_unit: Math.round(parseFloat(form.deposit_per_unit) * 100),
        min_quantity: form.min_quantity ? parseInt(form.min_quantity) : undefined,
        max_quantity: form.max_quantity ? parseInt(form.max_quantity) : undefined,
        total_available: parseInt(form.total_available),
        open_date: new Date(form.open_date).toISOString(),
        close_date: new Date(form.close_date).toISOString(),
        status: form.status,
        image_src: form.image_src || undefined,
      }),
    onSuccess: () => {
      toast({ description: "Booking event created" })
      queryClient.invalidateQueries({ queryKey: ["admin-booking-events"] })
      router.push("/dashboard/farmnport/orders/booking-events")
    },
    onError: () => toast({ description: "Failed to create event", variant: "destructive" }),
  })

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="New Booking Event" text="Create a pre-order livestock batch for clients to reserve." />

      <div className="max-w-2xl space-y-6">

        {/* Basic info */}
        <div className="border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm">Event Details</h2>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Title *</label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Supa Chics — May 2026 Batch"
              className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="What's included in this batch..."
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

        {/* Product link */}
        <div className="border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm">Product</h2>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Product Type *</label>
            <select
              value={form.product_type}
              onChange={(e) =>
                setForm((f) => ({ ...f, product_type: e.target.value, product_id: "", product_name: "", product_slug: "" }))
              }
              className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring bg-background"
            >
              <option value="animal_health">Animal Health</option>
              <option value="feed">Feed</option>
              <option value="agrochemical">Agrochemical</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Product *</label>
            <ProductCombobox
              productType={form.product_type as ProductType}
              value={form.product_id}
              onChange={(selection) =>
                setForm((f) => ({
                  ...f,
                  product_id: selection.id,
                  product_name: selection.name,
                  product_slug: selection.slug,
                  product_type: selection.type,
                }))
              }
            />
            {form.product_name && (
              <p className="text-xs text-muted-foreground mt-1">
                Selected: <span className="font-medium text-foreground">{form.product_name}</span> · slug: {form.product_slug}
              </p>
            )}
          </div>
        </div>

        {/* Pricing & capacity */}
        <div className="border rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-sm">Pricing & Capacity</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Unit Price ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.unit_price}
                onChange={(e) => set("unit_price", e.target.value)}
                placeholder="5.00"
                className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Deposit per Unit ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.deposit_per_unit}
                onChange={(e) => set("deposit_per_unit", e.target.value)}
                placeholder="1.00"
                className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Total Available *</label>
              <input
                type="number"
                min="1"
                value={form.total_available}
                onChange={(e) => set("total_available", e.target.value)}
                placeholder="500"
                className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Min / Max per Order</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={form.min_quantity}
                  onChange={(e) => set("min_quantity", e.target.value)}
                  placeholder="Min"
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <input
                  type="number"
                  min="0"
                  value={form.max_quantity}
                  onChange={(e) => set("max_quantity", e.target.value)}
                  placeholder="Max"
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dates */}
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

        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !form.title || !form.product_id || !form.unit_price || !form.total_available || !form.open_date || !form.close_date}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Create Booking Event
        </button>
      </div>
    </DashboardShell>
  )
}
