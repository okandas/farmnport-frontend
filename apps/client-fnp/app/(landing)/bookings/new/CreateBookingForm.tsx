"use client"

import { useState } from "react"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { Loader2, X, MapPin, Search, ImagePlus } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SearchSelect } from "@/components/ui/search-select"
import { Calendar } from "@/components/ui/calendar"
import { createClientPreOrder, queryClientLocations, queryBrands, queryFarmProduceCategories, queryBreedsByFarmProduce, uploadImages } from "@/lib/query"

type SelectedLocation = { id: string; name: string }

function ImageUpload({ value, onChange }: { value: string; onChange: (src: string) => void }) {
  const mutation = useMutation({
    mutationFn: uploadImages,
    onSuccess: (res) => { const src = (res as any).data?.[0]?.img?.src; if (src) onChange(src) },
  })

  function onDrop(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append("product_image", file)
    mutation.mutate(fd)
  }

  return (
    <div className="space-y-3">
      {value && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
          <Image src={value} alt="main image" fill className="object-contain" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      {!value && (
        <label className="flex flex-col items-center justify-center w-full h-32 border border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors px-6 py-10">
          {mutation.isPending ? (
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          ) : (
            <>
              <ImagePlus className="w-8 h-8 text-gray-400" />
              <p className="mt-2 text-xs text-gray-500">Click to upload</p>
            </>
          )}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onDrop} />
        </label>
      )}
    </div>
  )
}

const inputCls = "block w-full rounded-md bg-background px-3 py-1.5 text-sm text-foreground outline outline-1 -outline-offset-1 outline-border placeholder:text-muted-foreground focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-ring"
const labelCls = "block text-sm/6 font-medium text-foreground"

function capitalizeWords(str: string) {
  return str.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
}

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
            No locations found.
          </div>
        )}
      </div>
    </div>
  )
}

export function CreateBookingForm() {
  const router = useRouter()
  const [selectedLocations, setSelectedLocations] = useState<SelectedLocation[]>([])

  const { data: locationsData } = useQuery({
    queryKey: ["client-locations"],
    queryFn: () => queryClientLocations(),
    refetchOnWindowFocus: false,
  })

  const allLocations: { id: string; name: string; active: boolean }[] = (locationsData as any)?.data?.locations ?? []
  const [otherImages, setOtherImages] = useState<string[]>([])

  const [form, setForm] = useState({
    subtitle: "",
    description: "",
    produce_id: "",
    produce_name: "",
    breed_id: "",
    breed_name: "",
    unit: "",
    name: "",
    unit_price: "",
    deposit_per_unit: "",
    min_quantity: "",
    max_quantity: "",
    quantity_step: "",
    total_available: "",
    open_date: "",
    close_date: "",
    image_src: "",
    supplier_type: "brand" as "client" | "brand",
    brand_id: "",
    brand_name: "",
    market_side: "supply" as "supply" | "demand",
    payment_deadline_hours: "48",
    buyer_notes: false,
    cancellation_fee: "0",
    transferable: false,
    delivery_dates: [] as Date[],
  })

  const mutation = useMutation({
    mutationFn: () =>
      createClientPreOrder({
        subtitle: form.subtitle || undefined,
        description: form.description || undefined,
        produce_id: form.produce_id,
        produce_name: form.produce_name,
        breed_id: form.breed_id || undefined,
        breed_name: form.breed_name || undefined,
        unit: form.unit,
        unit_price: Math.round(parseFloat(form.unit_price) * 100),
        deposit_per_unit: Math.round(parseFloat(form.deposit_per_unit || "0") * 100),
        min_quantity: form.min_quantity ? parseInt(form.min_quantity) : undefined,
        max_quantity: form.max_quantity ? parseInt(form.max_quantity) : undefined,
        quantity_step: form.quantity_step ? parseInt(form.quantity_step) : undefined,
        total_available: parseInt(form.total_available),
        open_date: form.open_date ? new Date(form.open_date).toISOString() : undefined,
        close_date: form.close_date ? new Date(form.close_date).toISOString() : undefined,
        image_src: form.image_src || undefined,
        other_images: otherImages.length ? otherImages : undefined,
        brand_id: form.brand_id || undefined,
        brand_name: form.brand_name || undefined,
        market_side: form.market_side,
        payment_deadline_hours: parseInt(form.payment_deadline_hours) || 48,
        buyer_notes: form.buyer_notes,
        cancellation_fee: parseInt(form.cancellation_fee) || 0,
        transferable: form.transferable,
        delivery_dates: form.delivery_dates.length ? form.delivery_dates.map((d) => d.toISOString().split("T")[0]) : undefined,
        delivery_locations: selectedLocations.length ? selectedLocations : undefined,
      } as any),
    onSuccess: () => {
      toast.success("Booking created — pending review.")
      router.push("/account/booking-preorders")
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to create booking. Please try again.")
    },
  })

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  return (
    <div className="mt-4 space-y-0 divide-y divide-border">

      {/* Event Details */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 py-10 md:grid-cols-3">
        <div>
          <h2 className="text-base/7 font-semibold text-foreground">Event Details</h2>
          <p className="mt-1 text-sm/6 text-muted-foreground">Basic information about this booking batch.</p>
        </div>
        <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6 md:col-span-2">
          <div className="col-span-full">
            <label className={labelCls}>Subtitle (marketing copy)</label>
            <div className="mt-2">
              <input value={form.subtitle} onChange={(e) => { if (e.target.value.length <= 120) set("subtitle", e.target.value) }} maxLength={120} placeholder="e.g. Reserve your seed potatoes for early summer planting" className={inputCls} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{form.subtitle.length}/120 — Title is auto-generated from supplier + produce.</p>
          </div>
          <div className="col-span-full">
            <label className={labelCls}>Description</label>
            <div className="mt-2">
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} placeholder="What's included in this batch..." className={inputCls + " resize-none"} />
            </div>
          </div>
          <div className="col-span-full">
            <label className={labelCls}>Main Image</label>
            <div className="mt-2">
              <ImageUpload value={form.image_src} onChange={(src) => set("image_src", src)} />
            </div>
          </div>
          <div className="col-span-full">
            <label className={labelCls}>Other Images</label>
            <div className="mt-2 flex flex-wrap gap-3">
              {otherImages.map((src, idx) => (
                <div key={idx} className="relative w-32 h-32 rounded-lg overflow-hidden border border-border">
                  <Image src={src} alt={`image ${idx + 1}`} fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setOtherImages((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <ImageUpload value="" onChange={(src) => setOtherImages((prev) => [...prev, src])} />
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
            <label className={labelCls}>Brand</label>
            <div className="mt-2">
              <SearchSelect
                queryKey="booking-event-brands"
                queryFn={(params) => queryBrands(params)}
                getItems={(page) => page?.data?.data || []}
                value={form.brand_id}
                onValueChange={(v) => setForm((f) => ({ ...f, brand_id: v, produce_id: "", produce_name: "", unit: "", name: "" }))}
                onItemSelect={(b) => setForm((f) => ({
                  ...f,
                  brand_id: b.id, brand_name: b.name,
                  produce_id: "", produce_name: "", unit: "",
                  name: buildName(b.name, "", f.total_available, ""),
                }))}
                getLabel={(b) => b.name}
                getValue={(b) => b.id}
                placeholder="Select brand (optional)"
                searchPlaceholder="Search brands..."
                clearable capitalize
              />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Optional — select if you&apos;re listing on behalf of a brand.</p>
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
                queryFn={() => queryFarmProduceCategories()}
                getItems={(page) => page?.data?.data || []}
                value={form.produce_id}
                onValueChange={(v) => setForm((f) => ({ ...f, produce_id: v }))}
                onItemSelect={(p) => setForm((f) => ({
                  ...f,
                  produce_id: p.id,
                  produce_name: p.name,
                  name: buildName(f.brand_name, p.name, f.total_available, f.unit),
                }))}
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
                queryFn={(p) => queryBreedsByFarmProduce({ ...p, farmProduceId: form.produce_id || "" })}
                getItems={(page) => page?.data?.data || []}
                value={form.breed_id}
                onValueChange={(v) => setForm((f) => ({ ...f, breed_id: v }))}
                onItemSelect={(b) => setForm((f) => ({
                  ...f,
                  breed_id: b.id,
                  breed_name: b.name,
                  name: buildName(f.brand_name, b.name || f.produce_name, f.total_available, f.unit),
                }))}
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
                onValueChange={(v) => setForm((f) => ({
                  ...f, unit: v, name: buildName(f.brand_name, f.produce_name, f.total_available, v),
                }))}
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
              <span className="font-medium text-foreground">Pre-order name: </span>{form.name}
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
                  name: buildName(f.brand_name, f.produce_name, e.target.value, f.unit),
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
          <div className="sm:col-span-2">
            <label className={labelCls}>Batch Size</label>
            <div className="mt-2">
              <input type="number" min="0" value={form.quantity_step} onChange={(e) => set("quantity_step", e.target.value)} placeholder="e.g. 50" className={inputCls} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Buyers order in multiples of this. Leave empty for any quantity.</p>
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
            <label className={labelCls}>Closes</label>
            <div className="mt-2">
              <input type="datetime-local" value={form.close_date} onChange={(e) => set("close_date", e.target.value)} className={inputCls} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Leave empty if you supply or buy throughout the year.</p>
          </div>
        </div>
      </div>

      {/* Booking Settings */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-10 py-10 md:grid-cols-3">
        <div>
          <h2 className="text-base/7 font-semibold text-foreground">Booking Settings</h2>
          <p className="mt-1 text-sm/6 text-muted-foreground">Payment deadline, cancellation, and buyer preferences.</p>
        </div>
        <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6 md:col-span-2">
          <div className="sm:col-span-3">
            <label className={labelCls}>Market Side</label>
            <div className="mt-2">
              <Select value={form.market_side} onValueChange={(v) => set("market_side", v as "supply" | "demand")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="supply">Supply — seller listing (eggs, chicks, seed)</SelectItem>
                  <SelectItem value="demand">Demand — buyer wanting product brought to them (abattoir slot)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="sm:col-span-3">
            <label className={labelCls}>Payment Deadline (hours)</label>
            <div className="mt-2">
              <input type="number" min="1" value={form.payment_deadline_hours} onChange={(e) => set("payment_deadline_hours", e.target.value)} placeholder="48" className={inputCls} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Hours buyer has to pay after confirmation. Default 48.</p>
          </div>
          <div className="sm:col-span-3">
            <label className={labelCls}>Cancellation Fee (%)</label>
            <div className="mt-2">
              <input type="number" min="0" max="100" value={form.cancellation_fee} onChange={(e) => set("cancellation_fee", e.target.value)} placeholder="0" className={inputCls} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Handling fee on cancellations before deadline. 0 = no fee.</p>
          </div>
          <div className="sm:col-span-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.buyer_notes} onChange={(e) => setForm((f) => ({ ...f, buyer_notes: e.target.checked }))} className="rounded border-border" />
              <span className={labelCls}>Allow buyer notes</span>
            </label>
            <p className="mt-1 text-xs text-muted-foreground">Show a notes field for preferences (e.g. seed size).</p>
          </div>
          <div className="sm:col-span-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.transferable} onChange={(e) => setForm((f) => ({ ...f, transferable: e.target.checked }))} className="rounded border-border" />
              <span className={labelCls}>Transferable bookings</span>
            </label>
            <p className="mt-1 text-xs text-muted-foreground">Allow bookings to be transferred to another buyer or variety.</p>
          </div>
          {!form.close_date && (
            <div className="col-span-full">
              <label className={labelCls}>Available Delivery Dates</label>
              <p className="mt-1 mb-3 text-xs text-muted-foreground">
                No close date = always available. Click dates on the calendar to mark when you can deliver. Buyers will pick from these dates.
              </p>
              {form.delivery_dates.length > 0 && (
                <p className="text-xs font-medium text-primary mb-2">{form.delivery_dates.length} date{form.delivery_dates.length !== 1 ? "s" : ""} selected</p>
              )}
              <Calendar
                mode="multiple"
                selected={form.delivery_dates}
                onSelect={(dates) => setForm((f) => ({ ...f, delivery_dates: dates || [] }))}
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
        <div className="max-w-2xl md:col-span-2">
          <LocationMultiSelect
            allLocations={allLocations}
            selected={selectedLocations}
            onChange={setSelectedLocations}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-x-4 border-t border-border pt-6">
        <Link href="/bookings" className="text-sm/6 font-semibold text-foreground">
          Cancel
        </Link>
        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !form.produce_id || !form.unit || !form.unit_price || !form.total_available || !form.open_date}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Booking Event
        </button>
      </div>

    </div>
  )
}
