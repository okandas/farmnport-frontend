"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { Plus, X, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

import { createDeliveryLocation } from "@/lib/query"
import { LocationPicker } from "@/components/ui/location-picker"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"

const EMPTY_FORM = {
  name: "",
  address: "",
  city: "",
  time_slots: [""],
  phones: [""],
  latitude: 0,
  longitude: 0,
  active: true,
}

function DynamicList({
  label,
  values,
  onChange,
  placeholder,
}: {
  label: string
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
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <div className="space-y-2">
        {values.map((val, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={val}
              onChange={(e) => updateItem(i, e.target.value)}
              placeholder={placeholder}
              className="flex-1 text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {values.length > 1 && (
              <button type="button" onClick={() => removeItem(i)} className="text-muted-foreground hover:text-destructive">
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
    </div>
  )
}

export default function NewDeliveryLocationPage() {
  const router = useRouter()
  const [form, setForm] = useState(EMPTY_FORM)

  function set(field: string, value: any) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const mutation = useMutation({
    mutationFn: () =>
      createDeliveryLocation({
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
      toast({ description: "Delivery location created" })
      router.push("/dashboard/farmnport/orders/delivery-locations")
    },
    onError: () => toast({ description: "Failed to create location", variant: "destructive" }),
  })

  return (
    <DashboardShell>
      <DashboardHeader heading="New Delivery Location" text="Add a drop-off hub for farmer deliveries." />
      <div className="max-w-xl space-y-5">
        <div className="space-y-1">
          <label className="text-sm font-medium">Name *</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Fivet Poultry & Livestock Centre Marondera"
            className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Address *</label>
          <input
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="Stand No 5202, Marondera Township"
            className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">City *</label>
          <input
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            placeholder="Marondera"
            className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <DynamicList
          label="Time Slots"
          values={form.time_slots}
          onChange={(vals) => set("time_slots", vals)}
          placeholder="08:00-16:30"
        />

        <DynamicList
          label="Contact Numbers"
          values={form.phones}
          onChange={(vals) => set("phones", vals)}
          placeholder="+263771234567"
        />

        <div className="space-y-2">
          <label className="text-sm font-medium">GPS Location</label>
          <LocationPicker
            latitude={form.latitude || undefined}
            longitude={form.longitude || undefined}
            onSelect={(place) => {
              set("latitude", place.latitude)
              set("longitude", place.longitude)
              if (place.address && !form.address) set("address", place.address)
              if (place.city && !form.city) set("city", place.city)
            }}
          />
          {form.latitude !== 0 && (
            <p className="text-xs text-muted-foreground">
              {form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="active"
            checked={form.active}
            onChange={(e) => set("active", e.target.checked)}
            className="rounded"
          />
          <label htmlFor="active" className="text-sm">Active (visible to farmers)</label>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.name || !form.address || !form.city}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Location
          </button>
          <button
            onClick={() => router.back()}
            className="text-sm text-muted-foreground hover:text-foreground px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </DashboardShell>
  )
}
