"use client"

import { use, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Loader2, MapPin, X, Search } from "lucide-react"
import Link from "next/link"

import { queryAdminBookingEvents, updateBookingEvent, queryDeliveryLocations } from "@/lib/query"
import { toast } from "@/components/ui/use-toast"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { Placeholder } from "@/components/state/placeholder"
import { ClientCombobox } from "@/components/structures/client-combobox"
import { FarmProduceCategoryCombobox, FarmProduceCombobox } from "@/components/structures/farm-produce-combobox"

type SelectedLocation = { id: string; name: string }

const inputCls = "block w-full rounded-md bg-background px-3 py-1.5 text-sm text-foreground outline outline-1 -outline-offset-1 outline-border placeholder:text-muted-foreground focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-ring"
const labelCls = "block text-sm/6 font-medium text-foreground"

function toInputDate(iso: string) {
  if (!iso) return ""
  return new Date(iso).toISOString().slice(0, 16)
}

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
            <Link href="/dashboard/farmnport/orders/delivery-locations/new" target="_blank" className="text-primary hover:underline">
              Add one
            </Link>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Can&apos;t find a location?{" "}
        <Link href="/dashboard/farmnport/orders/delivery-locations/new" target="_blank" className="text-primary hover:underline">
          Add new location
        </Link>
      </p>
    </div>
  )
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

  const { data: locationsData } = useQuery({
    queryKey: ["admin-delivery-locations"],
    queryFn: () => queryDeliveryLocations(),
    refetchOnWindowFocus: false,
  })

  const allLocations: { id: string; name: string; active: boolean }[] = locationsData?.data?.locations ?? []
  const [selectedLocations, setSelectedLocations] = useState<SelectedLocation[] | null>(null)

  const events: any[] = data?.data?.events ?? []
  const event = events.find((e: any) => e.id === id)

  const [form, setForm] = useState<{
    title: string
    description: string
    status: string
    total_available: string
    unit_price: string
    deposit_per_unit: string
    min_quantity: string
    max_quantity: string
    open_date: string
    close_date: string
    image_src: string
    client_id: string
    client_name: string
    product_type: string
    product_id: string
    product_name: string
    product_slug: string
  } | null>(null)

  if (event && form === null) {
    if (selectedLocations === null) {
      setSelectedLocations(event.delivery_locations ?? [])
    }
    setForm({
      title: event.title ?? "",
      description: event.description ?? "",
      status: event.status ?? "draft",
      total_available: String(event.total_available ?? ""),
      unit_price: ((event.unit_price ?? 0) / 100).toFixed(2),
      deposit_per_unit: ((event.deposit_per_unit ?? 0) / 100).toFixed(2),
      min_quantity: event.min_quantity ? String(event.min_quantity) : "",
      max_quantity: event.max_quantity ? String(event.max_quantity) : "",
      open_date: toInputDate(event.open_date),
      close_date: toInputDate(event.close_date),
      image_src: event.image_src ?? "",
      client_id: event.client_id ?? "",
      client_name: event.client_name ?? "",
      product_type: event.product_type ?? "",
      product_id: event.product_id ?? "",
      product_name: event.product_name ?? "",
      product_slug: event.product_slug ?? "",
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
        min_quantity: form!.min_quantity ? parseInt(form!.min_quantity) : undefined,
        max_quantity: form!.max_quantity ? parseInt(form!.max_quantity) : undefined,
        open_date: new Date(form!.open_date).toISOString(),
        close_date: new Date(form!.close_date).toISOString(),
        image_src: form!.image_src || undefined,
        client_id: form!.client_id || undefined,
        client_name: form!.client_name || undefined,
        product_id: form!.product_id || undefined,
        product_name: form!.product_name || undefined,
        product_slug: form!.product_slug || undefined,
        product_type: form!.product_type || undefined,
        delivery_locations: selectedLocations ?? undefined,
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

      <div className="mt-4 space-y-0 divide-y divide-border">

        {/* Event Details */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 py-10 md:grid-cols-3">
          <div>
            <h2 className="text-base/7 font-semibold text-foreground">Event Details</h2>
            <p className="mt-1 text-sm/6 text-muted-foreground">Basic information about this booking batch.</p>
          </div>
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6 md:col-span-2">
            <div className="col-span-full">
              <label className={labelCls}>Title *</label>
              <div className="mt-2">
                <input value={form.title} onChange={(e) => set("title", e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="col-span-full">
              <label className={labelCls}>Description</label>
              <div className="mt-2">
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className={inputCls + " resize-none"} />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className={labelCls}>Status</label>
              <div className="mt-2 grid grid-cols-1">
                <select value={form.status} onChange={(e) => set("status", e.target.value)} className={inputCls + " appearance-none"}>
                  <option value="draft">Draft</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="cancelled">Cancelled</option>
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
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 py-10 md:grid-cols-3">
          <div>
            <h2 className="text-base/7 font-semibold text-foreground">Supplier</h2>
            <p className="mt-1 text-sm/6 text-muted-foreground">The client supplying this batch.</p>
          </div>
          <div className="max-w-2xl md:col-span-2">
            <label className={labelCls}>Client *</label>
            <div className="mt-2">
              <ClientCombobox
                value={form.client_id}
                onChange={(s) => setForm((f) => f ? { ...f, client_id: s.id, client_name: s.name } : f)}
              />
            </div>
          </div>
        </div>

        {/* Product */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 py-10 md:grid-cols-3">
          <div>
            <h2 className="text-base/7 font-semibold text-foreground">Product</h2>
            <p className="mt-1 text-sm/6 text-muted-foreground">What is being sold in this event.</p>
          </div>
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6 md:col-span-2">
            <div className="sm:col-span-3">
              <label className={labelCls}>Category *</label>
              <div className="mt-2">
                <FarmProduceCategoryCombobox
                  value={form.product_type}
                  onChange={(slug) =>
                    setForm((f) => f ? { ...f, product_type: slug, product_id: "", product_name: "", product_slug: "" } : f)
                  }
                />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className={labelCls}>Product *</label>
              <div className="mt-2">
                <FarmProduceCombobox
                  categorySlug={form.product_type}
                  value={form.product_id}
                  onChange={(s) =>
                    setForm((f) => f ? { ...f, product_id: s.id, product_name: s.name, product_slug: s.slug } : f)
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pricing & Capacity */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 py-10 md:grid-cols-3">
          <div>
            <h2 className="text-base/7 font-semibold text-foreground">Pricing & Capacity</h2>
            <p className="mt-1 text-sm/6 text-muted-foreground">Set the price, deposit, and quantity limits.</p>
          </div>
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6 md:col-span-2">
            <div className="sm:col-span-3">
              <label className={labelCls}>Unit Price ($) *</label>
              <div className="mt-2">
                <input type="number" step="0.01" min="0" value={form.unit_price} onChange={(e) => set("unit_price", e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className={labelCls}>Deposit per Unit ($) *</label>
              <div className="mt-2">
                <input type="number" step="0.01" min="0" value={form.deposit_per_unit} onChange={(e) => set("deposit_per_unit", e.target.value)} className={inputCls} />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls}>Total Available *</label>
              <div className="mt-2">
                <input type="number" min="1" value={form.total_available} onChange={(e) => set("total_available", e.target.value)} className={inputCls} />
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
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 py-10 md:grid-cols-3">
          <div>
            <h2 className="text-base/7 font-semibold text-foreground">Booking Window</h2>
            <p className="mt-1 text-sm/6 text-muted-foreground">When customers can place their bookings.</p>
          </div>
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6 md:col-span-2">
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
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 py-10 md:grid-cols-3">
          <div>
            <h2 className="text-base/7 font-semibold text-foreground">Collection Points</h2>
            <p className="mt-1 text-sm/6 text-muted-foreground">Where customers can collect their order.</p>
          </div>
          <div className="max-w-2xl md:col-span-2">
            <LocationMultiSelect
              allLocations={allLocations}
              selected={selectedLocations ?? []}
              onChange={setSelectedLocations}
            />
          </div>
        </div>

      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-x-4 border-t border-border pt-6">
        <Link href="/dashboard/farmnport/orders/booking-events" className="text-sm/6 font-semibold text-foreground">
          Cancel
        </Link>
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !form.title || !form.unit_price || !form.total_available}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </DashboardShell>
  )
}
