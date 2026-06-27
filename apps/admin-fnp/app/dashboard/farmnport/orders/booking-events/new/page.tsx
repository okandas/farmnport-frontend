"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Loader2, X, MapPin, Search } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

import { createBookingEvent, queryClientLocations, queryUsers, queryLivestockPoultryProducts, querySeedProducts, queryBrands } from "@/lib/query"
import { capitalizeWords } from "@/lib/utilities"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchSelect } from "@/components/ui/search-select"

type SelectedLocation = { id: string; name: string }

const inputCls = "block w-full rounded-md bg-background px-3 py-1.5 text-sm text-foreground outline outline-1 -outline-offset-1 outline-border placeholder:text-muted-foreground focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-ring"
const labelCls = "block text-sm/6 font-medium text-foreground"

function buildName(clientName: string, productName: string, totalAvailable: string, unit: string) {
  const parts = [clientName, productName, totalAvailable, unit].filter(Boolean).map(capitalizeWords)
  return parts.length ? parts.join(" ") + " Book Today" : ""
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
            <Link href="/dashboard/farmnport/orders/client-locations/new" target="_blank" className="text-primary hover:underline">
              Add one
            </Link>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Can&apos;t find a location?{" "}
        <Link href="/dashboard/farmnport/orders/client-locations/new" target="_blank" className="text-primary hover:underline">
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
    queryKey: ["admin-client-locations"],
    queryFn: () => queryClientLocations(),
    refetchOnWindowFocus: false,
  })

  const allLocations: { id: string; name: string; active: boolean }[] = locationsData?.data?.locations ?? []

  const [form, setForm] = useState({
    title: "",
    description: "",
    product_type: "",
    product_id: "",
    product_name: "",
    product_slug: "",
    unit: "",
    name: "",
    unit_price: "",
    deposit_per_unit: "",
    min_quantity: "",
    max_quantity: "",
    total_available: "",
    open_date: "",
    close_date: "",
    status: "draft",
    image_src: "",
    supplier_type: "brand" as "client" | "brand",
    client_id: "",
    client_name: "",
    brand_id: "",
    brand_name: "",
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
        unit: form.unit || undefined,
        name: form.name || undefined,
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
        brand_id: form.brand_id || undefined,
        brand_name: form.brand_name || undefined,
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
              <div className="mt-2">
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
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
                    onClick={() => setForm((f) => ({
                      ...f, supplier_type: type,
                      client_id: "", client_name: "", brand_id: "", brand_name: "",
                      product_id: "", product_name: "", product_slug: "", unit: "", name: "",
                    }))}
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
                    onValueChange={(v) => setForm((f) => ({ ...f, client_id: v, product_id: "", product_name: "", product_slug: "", unit: "", name: "" }))}
                    onItemSelect={(u) => setForm((f) => ({
                      ...f,
                      client_id: u.id, client_name: u.name,
                      product_id: "", product_name: "", product_slug: "", unit: "",
                      name: buildName(u.name, "", f.total_available, ""),
                    }))}
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
                    onValueChange={(v) => setForm((f) => ({ ...f, brand_id: v, product_id: "", product_name: "", product_slug: "", unit: "", name: "" }))}
                    onItemSelect={(b) => setForm((f) => ({
                      ...f,
                      brand_id: b.id, brand_name: b.name,
                      product_id: "", product_name: "", product_slug: "", unit: "",
                      name: buildName(b.name, "", f.total_available, ""),
                    }))}
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

        {/* Product */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 py-10 md:grid-cols-3">
          <div>
            <h2 className="text-base/7 font-semibold text-foreground">Product</h2>
            <p className="mt-1 text-sm/6 text-muted-foreground">What is being sold in this event.</p>
          </div>
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6 md:col-span-2">
            <div className="sm:col-span-3">
              <label className={labelCls}>Product Type *</label>
              <div className="mt-2">
                <Select
                  value={form.product_type}
                  onValueChange={(v) => setForm((f) => ({
                    ...f, product_type: v, product_id: "", product_name: "", product_slug: "", unit: "", name: "",
                  }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="livestock_poultry">Livestock &amp; Poultry</SelectItem>
                    <SelectItem value="seed">Seed Products</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className={labelCls}>Product *</label>
              <div className="mt-2">
                <SearchSelect
                  queryKey={["booking-event-product", form.product_type, form.supplier_type, form.client_id, form.brand_id]}
                  queryFn={(params) => {
                    const filter = form.supplier_type === "client"
                      ? { seller_id: form.client_id || undefined }
                      : { brand_id: form.brand_id || undefined }
                    return form.product_type === "livestock_poultry"
                      ? queryLivestockPoultryProducts({ ...params, ...filter })
                      : querySeedProducts({ ...params, ...filter })
                  }}
                  getItems={(page) => page?.data?.data || []}
                  value={form.product_id}
                  onValueChange={(v) => setForm((f) => ({ ...f, product_id: v }))}
                  onItemSelect={(p) => setForm((f) => ({
                    ...f,
                    product_id: p.id,
                    product_name: p.name,
                    product_slug: p.slug,
                    unit: "",
                    name: buildName(f.client_name || f.brand_name, p.name, f.total_available, ""),
                  }))}
                  getLabel={(p) => p.name}
                  getValue={(p) => p.id}
                  placeholder="Select product"
                  searchPlaceholder="Search products..."
                  disabled={!form.product_type || (form.supplier_type === "client" ? !form.client_id : !form.brand_id)}
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
                  onValueChange={(v) => setForm((f) => ({
                    ...f, unit: v, name: buildName(f.client_name, f.product_name, f.total_available, v),
                  }))}
                  disabled={!form.product_id}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {form.product_type === "livestock_poultry" && (
                      <>
                        <SelectItem value="birds">Birds</SelectItem>
                        <SelectItem value="chicks">Chicks</SelectItem>
                        <SelectItem value="heads">Heads</SelectItem>
                      </>
                    )}
                    {form.product_type === "seed" && (
                      <>
                        <SelectItem value="pockets">Pockets</SelectItem>
                        <SelectItem value="bags">Bags</SelectItem>
                        <SelectItem value="kg">Kg</SelectItem>
                      </>
                    )}
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
                <input
                  type="number" min="1" value={form.total_available}
                  onChange={(e) => setForm((f) => ({
                    ...f,
                    total_available: e.target.value,
                    name: buildName(f.client_name, f.product_name, e.target.value, f.unit),
                  }))}
                  placeholder="500" className={inputCls}
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
              selected={selectedLocations}
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
          disabled={mutation.isPending || !form.client_id || !form.title || !form.product_id || !form.unit || !form.unit_price || !form.total_available || !form.open_date || !form.close_date}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Booking Event
        </button>
      </div>
    </DashboardShell>
  )
}
