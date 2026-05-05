"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Plus, X, Loader2 } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

import { queryDeliveryLocations, updateDeliveryLocation } from "@/lib/query"
import { LocationPicker } from "@/components/ui/location-picker"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"

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
      <div className="max-w-xl space-y-5">
        <div className="space-y-1">
          <label className="text-sm font-medium">Name *</label>
          <input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Address *</label>
          <input
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
            className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">City *</label>
          <input
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
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
            Save Changes
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
