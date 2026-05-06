"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Loader2, X, MapPin, Search } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

import { createBookingEvent, queryDeliveryLocations } from "@/lib/query"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { ClientCombobox } from "@/components/structures/client-combobox"
import { FarmProduceCategoryCombobox, FarmProduceCombobox } from "@/components/structures/farm-produce-combobox"

type SelectedLocation = { id: string; name: string }

const inputCls = "block w-full rounded-md bg-background px-3 py-1.5 text-sm text-foreground outline outline-1 -outline-offset-1 outline-border placeholder:text-muted-foreground focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-ring"
const labelCls = "block text-sm/6 font-medium text-foreground"
const hintCls = "mt-1 text-sm/6 text-muted-foreground"
const sectionCls = "border-b border-border pb-10"

function LocationMultiSelect({
  allLocations,
  selected,
  onChange,
}: {
  allLocations: { id: string; name: string; active: boolean }[]
  selected: SelectedLocation[]
  onChange: (locs: SelectedLocation[]) => void
}) {
  const [search, setSearch] = useState("")
  const [open, setOpen] = useState(false)

  const active = allLocations.filter((l) => l.active)
  const filtered = active.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) &&
      !selected.find((s) => s.id === l.id)
  )

  function add(loc: { id: string; name: string }) {
    onChange([...selected, { id: loc.id, name: loc.name }])
    setSearch("")
    setOpen(false)
  }

  function remove(id: string) {
    onChange(selected.filter((s) => s.id !== id))
  }

  return (
    <div className="space-y-2">
      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((loc) => (
            <span
              key={loc.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              <MapPin className="w-3 h-3" />
              {loc.name}
              <button type="button" onClick={() => remove(loc.id)} className="hover:text-destructive ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <div className="flex items-center rounded-md bg-background outline outline-1 -outline-offset-1 outline-border focus-within:outline focus-within:outline-2 focus-within:-outline-offset-2 focus-within:outline-ring px-3 py-1.5 gap-2">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOpen(true) }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Search locations..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        {open && filtered.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-popover shadow-md">
            {filtered.map((loc) => (
              <button
                key={loc.id}
                type="button"
                onMouseDown={() => add(loc)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left"
              >
                <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                {loc.name}
              </button>
            ))}
          </div>
        )}

        {open && filtered.length === 0 && search.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-popover shadow-md px-3 py-2 text-sm text-muted-foreground">
            No locations found.{" "}
            <Link
              href="/dashboard/farmnport/orders/delivery-locations/new"
              target="_blank"
              className="text-primary hover:underline"
            >
              Add one
            </Link>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Can&apos;t find a location?{" "}
        <Link
          href="/dashboard/farmnport/orders/delivery-locations/new"
          target="_blank"
          className="text-primary hover:underline"
        >
          Add new location
        </Link>
      </p>
    </div>
  )
}

export default function NewBookingEventPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedLocations, setSelectedLocations] = useState<SelectedLocation[]>([])

  const { data: locationsData } = useQuery({
    queryKey: ["admin-delivery-locations"],
    queryFn: () => queryDeliveryLocations(),
    refetchOnWindowFocus: false,
  })

  const allLocations: { id: string; name: string; active: boolean }[] = locationsData?.data?.locations ?? []

  const [form, setForm] = useState({
    title: "",
    description: "",
    product_id: "",
    product_name: "",
    product_slug: "",
    product_type: "",
    unit_price: "",
    deposit_per_unit: "",
    min_quantity: "",
    max_quantity: "",
    total_available: "",
    open_date: "",
    close_date: "",
    status: "draft",
    image_src: "",
    client_id: "",
    client_name: "",
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
        client_id: form.client_id,
        client_name: form.client_name,
        delivery_locations: selectedLocations.length ? selectedLocations : undefined,
      }),
    onSuccess: () => {
      toast({ description: "Booking event created" })
      queryClient.invalidateQueries({ queryKey: ["admin-booking-events"] })
      router.push("/dashboard/farmnport/orders/booking-events")
    },
    onError: (err: any) => toast({ description: err?.response?.data?.message || "Failed to create event", variant: "destructive" }),
  })

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  return (
    <DashboardShell>
      <DashboardHeader heading="New Booking Event" text="Create a pre-order batch for customers to book." />

      <div className="max-w-2xl space-y-10 mt-2">

        {/* Event Details */}
        <div className={sectionCls}>
          <h2 className="text-base/7 font-semibold text-foreground">Event Details</h2>
          <p className={hintCls}>Basic information about this booking batch.</p>
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6">
            <div className="col-span-full">
              <label className={labelCls}>Title *</label>
              <div className="mt-2">
                <input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Fivet Day-Old Chicks — June 2026 Batch" className={inputCls} />
              </div>
            </div>
            <div className="col-span-full">
              <label className={labelCls}>Description</label>
              <div className="mt-2">
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="What's included in this batch..." className={inputCls + " resize-none"} />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className={labelCls}>Status</label>
              <div className="mt-2 grid grid-cols-1">
                <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls + " appearance-none"}>
                  <option value="draft">Draft</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className={labelCls}>Image URL</label>
              <div className="mt-2">
                <input value={form.image_src} onChange={(e) => set("image_src", e.target.value)} placeholder="https://..." className={inputCls} />
              </div>
            </div>
          </div>
        </div>

        {/* Supplier */}
        <div className={sectionCls}>
          <h2 className="text-base/7 font-semibold text-foreground">Supplier</h2>
          <p className={hintCls}>The client supplying this batch.</p>
          <div className="mt-6">
            <label className={labelCls}>Client *</label>
            <div className="mt-2">
              <ClientCombobox value={form.client_id} onChange={(s) => setForm((f) => ({ ...f, client_id: s.id, client_name: s.name }))} />
            </div>
          </div>
        </div>

        {/* Product */}
        <div className={sectionCls}>
          <h2 className="text-base/7 font-semibold text-foreground">Product</h2>
          <p className={hintCls}>What is being sold in this event.</p>
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label className={labelCls}>Category *</label>
              <div className="mt-2">
                <FarmProduceCategoryCombobox value={form.product_type} onChange={(slug) => setForm((f) => ({ ...f, product_type: slug, product_id: "", product_name: "", product_slug: "" }))} />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className={labelCls}>Product *</label>
              <div className="mt-2">
                <FarmProduceCombobox categorySlug={form.product_type} value={form.product_id} onChange={(s) => setForm((f) => ({ ...f, product_id: s.id, product_name: s.name, product_slug: s.slug }))} />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Capacity */}
        <div className={sectionCls}>
          <h2 className="text-base/7 font-semibold text-foreground">Pricing & Capacity</h2>
          <p className={hintCls}>Set the price, deposit, and quantity limits.</p>
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label className={labelCls}>Unit Price ($) *</label>
              <div className="mt-2">
                <input type="number" step="0.01" min="0" value={form.unit_price} onChange={(e) => set("unit_price", e.target.value)} placeholder="5.00" className={inputCls} />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className={labelCls}>Deposit per Unit ($) *</label>
              <div className="mt-2">
                <input type="number" step="0.01" min="0" value={form.deposit_per_unit} onChange={(e) => set("deposit_per_unit", e.target.value)} placeholder="1.00" className={inputCls} />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Total Available *</label>
              <div className="mt-2">
                <input type="number" min="1" value={form.total_available} onChange={(e) => set("total_available", e.target.value)} placeholder="500" className={inputCls} />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Min per Order</label>
              <div className="mt-2">
                <input type="number" min="0" value={form.min_quantity} onChange={(e) => set("min_quantity", e.target.value)} placeholder="10" className={inputCls} />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Max per Order</label>
              <div className="mt-2">
                <input type="number" min="0" value={form.max_quantity} onChange={(e) => set("max_quantity", e.target.value)} placeholder="200" className={inputCls} />
              </div>
            </div>
          </div>
        </div>

        {/* Booking Window */}
        <div className={sectionCls}>
          <h2 className="text-base/7 font-semibold text-foreground">Booking Window</h2>
          <p className={hintCls}>When customers can place their bookings.</p>
          <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label className={labelCls}>Opens *</label>
              <div className="mt-2">
                <input type="datetime-local" value={form.open_date} onChange={(e) => set("open_date", e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className={labelCls}>Closes *</label>
              <div className="mt-2">
                <input type="datetime-local" value={form.close_date} onChange={(e) => set("close_date", e.target.value)} className={inputCls} />
              </div>
            </div>
          </div>
        </div>

        {/* Collection Points */}
        <div className={sectionCls}>
          <h2 className="text-base/7 font-semibold text-foreground">Collection Points</h2>
          <p className={hintCls}>Where customers can collect their order. Select one or more locations.</p>
          <div className="mt-6">
            <LocationMultiSelect
              allLocations={allLocations}
              selected={selectedLocations}
              onChange={setSelectedLocations}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-x-4 pt-2">
          <Link href="/dashboard/farmnport/orders/booking-events" className="text-sm/6 font-semibold text-foreground">
            Cancel
          </Link>
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.client_id || !form.title || !form.product_id || !form.unit_price || !form.total_available || !form.open_date || !form.close_date}
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Booking Event
          </button>
        </div>
      </div>
    </DashboardShell>
  )
}
