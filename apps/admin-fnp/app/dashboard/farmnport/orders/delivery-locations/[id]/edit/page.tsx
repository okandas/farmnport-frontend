"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Plus, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

import { queryDeliveryLocations, updateDeliveryLocation } from "@/lib/query"
import { LocationPicker } from "@/components/ui/location-picker"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"

const inputCls = "block w-full rounded-md bg-background px-3 py-1.5 text-sm text-foreground outline outline-1 -outline-offset-1 outline-border placeholder:text-muted-foreground focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-ring"
const labelCls = "block text-sm/6 font-medium text-foreground"

function DynamicList({
  values,
  onChange,
  placeholder,
}: {
  values: string[]
  onChange: (vals: string[]) => void
  placeholder: string
}) {
  function updateItem(i: number, val: string) {
    const next = [...values]
    next[i] = val
    onChange(next)
  }
  function removeItem(i: number) {
    onChange(values.filter((_, idx) => idx !== i))
  }

  return (
    <div className="space-y-2">
      {values.map((val, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            value={val}
            onChange={(e) => updateItem(i, e.target.value)}
            placeholder={placeholder}
            className={inputCls}
          />
          {values.length > 1 && (
            <button type="button" onClick={() => removeItem(i)} className="text-muted-foreground hover:text-destructive shrink-0">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...values, ""])}
        className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <Plus className="w-3 h-3" /> Add another
      </button>
    </div>
  )
}

export default function EditDeliveryLocationPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    time_slots: [""],
    phones: [""],
    latitude: 0,
    longitude: 0,
    active: true,
  })
  const [loaded, setLoaded] = useState(false)

  const { data } = useQuery({
    queryKey: ["admin-delivery-locations"],
    queryFn: () => queryDeliveryLocations(),
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (data && !loaded) {
      const loc = data?.data?.locations?.find((l: any) => l.id === id)
      if (loc) {
        setForm({
          name: loc.name,
          address: loc.address,
          city: loc.city,
          time_slots: loc.time_slots?.length ? loc.time_slots : [""],
          phones: loc.phones?.length ? loc.phones : [""],
          latitude: loc.latitude || 0,
          longitude: loc.longitude || 0,
          active: loc.active,
        })
        setLoaded(true)
      }
    }
  }, [data, id, loaded])

  function set(field: string, value: any) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const mutation = useMutation({
    mutationFn: () =>
      updateDeliveryLocation(id, {
        name: form.name,
        address: form.address,
        city: form.city,
        time_slots: form.time_slots.map((s) => s.trim()).filter(Boolean),
        phones: form.phones.map((s) => s.trim()).filter(Boolean),
        latitude: form.latitude || undefined,
        longitude: form.longitude || undefined,
        active: form.active,
      }),
    onSuccess: () => {
      toast({ description: "Location updated" })
      router.push("/dashboard/farmnport/orders/delivery-locations")
    },
    onError: () => toast({ description: "Failed to update location", variant: "destructive" }),
  })

  return (
    <DashboardShell>
      <DashboardHeader heading="Edit Delivery Location" text="Update drop-off hub details." />

      <div className="mt-4 space-y-0 divide-y divide-border">

        {/* Location Details */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 py-10 md:grid-cols-3">
          <div>
            <h2 className="text-base/7 font-semibold text-foreground">Location Details</h2>
            <p className="mt-1 text-sm/6 text-muted-foreground">Basic information about this drop-off point.</p>
          </div>
          <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6 md:col-span-2">
            <div className="col-span-full">
              <label className={labelCls}>Name *</label>
              <div className="mt-2">
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="col-span-full">
              <label className={labelCls}>Address *</label>
              <div className="mt-2">
                <input
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
            <div className="sm:col-span-3">
              <label className={labelCls}>City *</label>
              <div className="mt-2">
                <input
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  className={inputCls}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 py-10 md:grid-cols-3">
          <div>
            <h2 className="text-base/7 font-semibold text-foreground">Operating Hours</h2>
            <p className="mt-1 text-sm/6 text-muted-foreground">Time slots when this location accepts collections.</p>
          </div>
          <div className="max-w-2xl md:col-span-2">
            <DynamicList
              values={form.time_slots}
              onChange={(vals) => set("time_slots", vals)}
              placeholder="08:00 - 16:30"
            />
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 py-10 md:grid-cols-3">
          <div>
            <h2 className="text-base/7 font-semibold text-foreground">Contact Numbers</h2>
            <p className="mt-1 text-sm/6 text-muted-foreground">Phone numbers customers can call at this location.</p>
          </div>
          <div className="max-w-2xl md:col-span-2">
            <DynamicList
              values={form.phones}
              onChange={(vals) => set("phones", vals)}
              placeholder="+263771234567"
            />
          </div>
        </div>

        {/* GPS */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 py-10 md:grid-cols-3">
          <div>
            <h2 className="text-base/7 font-semibold text-foreground">GPS Location</h2>
            <p className="mt-1 text-sm/6 text-muted-foreground">Pin this location on the map for directions.</p>
          </div>
          <div className="max-w-2xl md:col-span-2 space-y-2">
            <LocationPicker
              latitude={form.latitude || undefined}
              longitude={form.longitude || undefined}
              defaultValue={form.address}
              onSelect={(place) => {
                set("latitude", place.latitude)
                set("longitude", place.longitude)
              }}
            />
            {form.latitude !== 0 && (
              <p className="text-xs text-muted-foreground">
                {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}
              </p>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-10 py-10 md:grid-cols-3">
          <div>
            <h2 className="text-base/7 font-semibold text-foreground">Settings</h2>
            <p className="mt-1 text-sm/6 text-muted-foreground">Control visibility of this location.</p>
          </div>
          <div className="max-w-2xl md:col-span-2">
            <div className="flex gap-3">
              <div className="flex h-6 shrink-0 items-center">
                <input
                  id="active"
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => set("active", e.target.checked)}
                  className="size-4 rounded border-border bg-background checked:border-primary checked:bg-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                />
              </div>
              <div className="text-sm/6">
                <label htmlFor="active" className="font-medium text-foreground">Active</label>
                <p className="text-muted-foreground">Visible to customers as a collection point.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-x-4 border-t border-border pt-6">
        <Link href="/dashboard/farmnport/orders/delivery-locations" className="text-sm/6 font-semibold text-foreground">
          Cancel
        </Link>
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !form.name || !form.address || !form.city}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Changes
        </button>
      </div>
    </DashboardShell>
  )
}
