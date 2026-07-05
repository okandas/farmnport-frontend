"use client"

import { use, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import Link from "next/link"

import { queryAdminPreOrders, updatePreOrder, queryClientLocations, queryUsers, queryFarmProduce, queryBreeds, queryBrands } from "@/lib/query"
import { LocationMultiSelect } from "@/components/ui/location-multi-select"
import { capitalizeWords } from "@/lib/utilities"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { FormSkeleton } from "@/components/state/skeleton-table"
import { DashboardShell } from "@/components/state/dashboardShell"
import { Placeholder } from "@/components/state/placeholder"
import { SearchSelect } from "@/components/ui/search-select"
import { Calendar } from "@/components/ui/calendar"

type SelectedLocation = { id: string; name: string }

const inputCls = "block w-full rounded-md bg-background px-3 py-1.5 text-sm text-foreground outline outline-1 -outline-offset-1 outline-border placeholder:text-muted-foreground focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-ring"
const labelCls = "block text-sm/6 font-medium text-foreground"

function buildName(clientName: string, productName: string, totalAvailable: string, unit: string) {
  const parts = [clientName, productName, totalAvailable, unit].filter(Boolean).map(capitalizeWords)
  return parts.length ? parts.join(" ") + " Book Today" : ""
}

function toInputDate(iso: string) {
  if (!iso) return ""
  return new Date(iso).toISOString().slice(0, 16)
}


export default function EditPreOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-booking-events"],
    queryFn: () => queryAdminPreOrders(),
    refetchOnWindowFocus: false,
  })

  const { data: locationsData } = useQuery({
    queryKey: ["admin-client-locations"],
    queryFn: () => queryClientLocations(),
    refetchOnWindowFocus: false,
  })

  const allLocations: { id: string; name: string; active: boolean; types?: string[] }[] = locationsData?.data?.locations ?? []
  const [selectedDeliveryLocs, setSelectedDeliveryLocs] = useState<SelectedLocation[] | null>(null)
  const [selectedCollectionLocs, setSelectedCollectionLocs] = useState<SelectedLocation[] | null>(null)
  const [deliveryDates, setDeliveryDates] = useState<Date[] | null>(null)

  const events: any[] = data?.data?.preorders ?? []
  const event = events.find((e: any) => e.id === id)

  const [form, setForm] = useState<{
    title: string
    description: string
    status: string
    produce_id: string
    produce_name: string
    breed_id: string
    breed_name: string
    unit: string
    name: string
    total_available: string
    unit_price: string
    deposit_per_unit: string
    min_quantity: string
    max_quantity: string
    open_date: string
    close_date: string
    image_src: string
    supplier_type: "client" | "brand"
    client_id: string
    client_name: string
    brand_id: string
    brand_name: string
  } | null>(null)

  if (event && form === null) {
    if (selectedDeliveryLocs === null) {
      setSelectedDeliveryLocs(event.delivery_locations ?? [])
    }
    if (selectedCollectionLocs === null) {
      setSelectedCollectionLocs(event.collection_locations ?? [])
    }
    if (deliveryDates === null) {
      setDeliveryDates((event.delivery_dates ?? []).map((d: string) => new Date(d + "T00:00:00")))
    }
    setForm({
      title: event.title ?? "",
      description: event.description ?? "",
      status: event.status ?? "draft",
      produce_id: event.produce_id ?? "",
      produce_name: event.produce_name ?? "",
      breed_id: event.breed_id ?? "",
      breed_name: event.breed_name ?? "",
      unit: event.unit ?? "",
      name: event.name ?? "",
      total_available: String(event.total_available ?? ""),
      unit_price: ((event.unit_price ?? 0) / 100).toFixed(2),
      deposit_per_unit: ((event.deposit_per_unit ?? 0) / 100).toFixed(2),
      min_quantity: event.min_quantity ? String(event.min_quantity) : "",
      max_quantity: event.max_quantity ? String(event.max_quantity) : "",
      open_date: toInputDate(event.open_date),
      close_date: toInputDate(event.close_date),
      image_src: event.image_src ?? "",
      supplier_type: (event.client_id && !event.brand_id ? "client" : "brand") as "client" | "brand",
      client_id: event.client_id ?? "",
      client_name: event.client_name ?? "",
      brand_id: event.brand_id ?? "",
      brand_name: event.brand_name ?? "",
    })
  }

  const mutation = useMutation({
    mutationFn: () =>
      updatePreOrder(id, {
        title: form!.title,
        description: form!.description || undefined,
        status: form!.status,
        produce_id: form!.produce_id || undefined,
        produce_name: form!.produce_name || undefined,
        breed_id: form!.breed_id || undefined,
        breed_name: form!.breed_name || undefined,
        unit: form!.unit || undefined,
        name: form!.name || undefined,
        total_available: parseInt(form!.total_available),
        unit_price: Math.round(parseFloat(form!.unit_price) * 100),
        deposit_per_unit: Math.round(parseFloat(form!.deposit_per_unit) * 100),
        min_quantity: form!.min_quantity ? parseInt(form!.min_quantity) : undefined,
        max_quantity: form!.max_quantity ? parseInt(form!.max_quantity) : undefined,
        open_date: new Date(form!.open_date).toISOString(),
        close_date: form!.close_date ? new Date(form!.close_date).toISOString() : "",
        image_src: form!.image_src || undefined,
        client_id: form!.client_id || undefined,
        client_name: form!.client_name || undefined,
        brand_id: form!.brand_id || undefined,
        brand_name: form!.brand_name || undefined,
        delivery_dates: deliveryDates ? deliveryDates.map((d) => d.toISOString().split("T")[0]) : undefined,
        delivery_locations: selectedDeliveryLocs ?? undefined,
        collection_locations: selectedCollectionLocs ?? undefined,
      }),
    onSuccess: () => {
      toast({ description: "Event updated" })
      queryClient.invalidateQueries({ queryKey: ["admin-booking-events"] })
      router.push("/dashboard/farmnport/orders/booking-preorders")
    },
    onError: () => toast({ description: "Failed to update event", variant: "destructive" }),
  })

  function set(field: string, value: string) {
    setForm((f) => f ? { ...f, [field]: value } : f)
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <FormSkeleton />
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
              <label className={labelCls}>Title (Lot Name) *</label>
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
              <div className="mt-2">
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="fulfilled">Fulfilled</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Supplier */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 py-10 md:grid-cols-3">
          <div>
            <h2 className="text-base/7 font-semibold text-foreground">Supplier</h2>
            <p className="mt-1 text-sm/6 text-muted-foreground">Who is supplying this batch.</p>
          </div>
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6 md:col-span-2">
            <div className="col-span-full">
              <label className={labelCls}>Supplier Type</label>
              <div className="mt-2 flex gap-2">
                {(["brand", "client"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm((f) => f ? {
                      ...f, supplier_type: type,
                      client_id: "", client_name: "", brand_id: "", brand_name: "",
                      produce_id: "", produce_name: "", unit: "", name: "",
                    } : f)}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium border transition-colors ${
                      form.supplier_type === type
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-foreground"
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="col-span-full">
              <label className={labelCls}>{form.supplier_type === "client" ? "Client *" : "Brand *"}</label>
              <div className="mt-2">
                {form.supplier_type === "client" ? (
                  <SearchSelect
                    queryKey="booking-event-clients"
                    queryFn={(params) => queryUsers(params)}
                    getItems={(page) => page?.data?.data || []}
                    value={form.client_id}
                    onValueChange={(v) => setForm((f) => f ? { ...f, client_id: v, produce_id: "", produce_name: "", unit: "", name: "" } : f)}
                    onItemSelect={(u) => setForm((f) => f ? {
                      ...f,
                      client_id: u.id, client_name: u.name,
                      produce_id: "", produce_name: "", unit: "",
                      name: buildName(u.name, "", f.total_available, ""),
                    } : f)}
                    getLabel={(u) => u.name}
                    getValue={(u) => u.id}
                    placeholder="Select client"
                    searchPlaceholder="Search clients..."
                    clearable capitalize
                  />
                ) : (
                  <SearchSelect
                    queryKey="booking-event-brands"
                    queryFn={(params) => queryBrands(params)}
                    getItems={(page) => page?.data?.data || []}
                    value={form.brand_id}
                    onValueChange={(v) => setForm((f) => f ? { ...f, brand_id: v, produce_id: "", produce_name: "", unit: "", name: "" } : f)}
                    onItemSelect={(b) => setForm((f) => f ? {
                      ...f,
                      brand_id: b.id, brand_name: b.name,
                      produce_id: "", produce_name: "", unit: "",
                      name: buildName(b.name, "", f.total_available, ""),
                    } : f)}
                    getLabel={(b) => b.name}
                    getValue={(b) => b.id}
                    placeholder="Select brand"
                    searchPlaceholder="Search brands..."
                    clearable capitalize
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Produce */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 py-10 md:grid-cols-3">
          <div>
            <h2 className="text-base/7 font-semibold text-foreground">Produce</h2>
            <p className="mt-1 text-sm/6 text-muted-foreground">What is being sold in this pre-order.</p>
          </div>
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6 md:col-span-2">
            <div className="sm:col-span-3">
              <label className={labelCls}>Produce *</label>
              <div className="mt-2">
                <SearchSelect
                  queryKey="booking-event-produce"
                  queryFn={(params) => queryFarmProduce(params)}
                  getItems={(page) => page?.data?.data || []}
                  value={form.produce_id}
                  onValueChange={(v) => setForm((f) => f ? { ...f, produce_id: v } : f)}
                  onItemSelect={(p) => setForm((f) => f ? {
                    ...f,
                    produce_id: p.id,
                    produce_name: p.name,
                    name: buildName(f.client_name || f.brand_name, p.name, f.total_available, f.unit),
                  } : f)}
                  getLabel={(p) => p.name}
                  getValue={(p) => p.id}
                  placeholder="Select produce"
                  searchPlaceholder="Search produce..."
                  clearable
                  capitalize
                />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className={labelCls}>Breed / Variety</label>
              <div className="mt-2">
                <SearchSelect
                  queryKey={["booking-event-breed", form.produce_id]}
                  queryFn={(params) => queryBreeds({ ...params, farm_produce_id: form.produce_id || undefined })}
                  getItems={(page) => page?.data?.data || []}
                  value={form.breed_id}
                  onValueChange={(v) => setForm((f) => f ? { ...f, breed_id: v } : f)}
                  onItemSelect={(b) => setForm((f) => f ? {
                    ...f,
                    breed_id: b.id,
                    breed_name: b.name,
                    name: buildName(f.client_name || f.brand_name, b.name || f.produce_name, f.total_available, f.unit),
                  } : f)}
                  getLabel={(b) => b.name}
                  getValue={(b) => b.id}
                  placeholder="Select breed/variety"
                  searchPlaceholder="Search breeds..."
                  disabled={!form.produce_id}
                  clearable
                  capitalize
                />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className={labelCls}>Unit *</label>
              <div className="mt-2">
                <Select
                  value={form.unit}
                  onValueChange={(v) => setForm((f) => f ? {
                    ...f, unit: v, name: buildName(f.client_name || f.brand_name, f.produce_name, f.total_available, v),
                  } : f)}
                  disabled={!form.produce_id}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="birds">Birds</SelectItem>
                    <SelectItem value="chicks">Chicks</SelectItem>
                    <SelectItem value="heads">Heads</SelectItem>
                    <SelectItem value="crates">Crates</SelectItem>
                    <SelectItem value="pockets">Pockets</SelectItem>
                    <SelectItem value="bags">Bags</SelectItem>
                    <SelectItem value="kg">Kg</SelectItem>
                    <SelectItem value="units">Units</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.name && (
              <div className="col-span-full rounded-md bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Event name: </span>{form.name}
              </div>
            )}
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
                <input
                  type="number" min="1" value={form.total_available}
                  onChange={(e) => setForm((f) => f ? {
                    ...f,
                    total_available: e.target.value,
                    name: buildName(f.client_name || f.brand_name, f.produce_name, e.target.value, f.unit),
                  } : f)}
                  className={inputCls}
                />
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
              <label className={labelCls}>Closes (leave empty = always available)</label>
              <div className="mt-2">
                <input type="datetime-local" value={form.close_date} onChange={(e) => set("close_date", e.target.value)} className={inputCls} />
              </div>
              {form.close_date && (
                <button type="button" onClick={() => set("close_date", "")} className="mt-1 text-xs text-primary hover:underline">
                  Clear close date (make always available)
                </button>
              )}
            </div>
            {!form.close_date && (
              <div className="col-span-full">
                <label className={labelCls}>Available Delivery Dates</label>
                <p className="mt-1 mb-3 text-xs text-muted-foreground">
                  No close date = always available. Click dates to mark when you can deliver.
                </p>
                {(deliveryDates ?? []).length > 0 && (
                  <p className="text-xs font-medium text-primary mb-2">{(deliveryDates ?? []).length} date{(deliveryDates ?? []).length !== 1 ? "s" : ""} selected</p>
                )}
                <Calendar
                  mode="multiple"
                  selected={deliveryDates ?? []}
                  onSelect={(dates) => setDeliveryDates(dates || [])}
                  disabled={{ before: new Date() }}
                  numberOfMonths={2}
                  className="rounded-md border"
                />
              </div>
            )}
          </div>
        </div>

        {/* Collection Points */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 py-10 md:grid-cols-3">
          <div>
            <h2 className="text-base/7 font-semibold text-foreground">Collection Points</h2>
            <p className="mt-1 text-sm/6 text-muted-foreground">Where customers can collect their order.</p>
          </div>
          <div className="max-w-2xl md:col-span-2 space-y-6">
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Delivery</p>
              <LocationMultiSelect
                queryKey="location-picker-delivery"
                allLocations={allLocations.filter((l) => l.active)}
                selected={selectedDeliveryLocs ?? []}
                onChange={setSelectedDeliveryLocs}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground mb-2">Collection</p>
              <LocationMultiSelect
                queryKey="location-picker-collection"
                allLocations={allLocations.filter((l) => l.active)}
                selected={selectedCollectionLocs ?? []}
                onChange={setSelectedCollectionLocs}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-x-4 border-t border-border pt-6">
        <Link href="/dashboard/farmnport/orders/booking-preorders" className="text-sm/6 font-semibold text-foreground">
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
