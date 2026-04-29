"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { PlusCircle, Loader2, MapPin, Pencil, X } from "lucide-react"
import { toast } from "sonner"

import { queryDeliveryLocations, createDeliveryLocation, updateDeliveryLocation } from "@/lib/query"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"

interface Location {
  id: string
  name: string
  address: string
  city: string
  time_slots: string[]
  active: boolean
}

const EMPTY_FORM = { name: "", address: "", city: "", time_slots_raw: "", active: true }

export default function DeliveryLocationsPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Location | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const { data, isLoading } = useQuery({
    queryKey: ["admin-delivery-locations"],
    queryFn: () => queryDeliveryLocations(),
    refetchOnWindowFocus: false,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      createDeliveryLocation({
        name: form.name,
        address: form.address,
        city: form.city,
        time_slots: form.time_slots_raw.split("\n").map((s) => s.trim()).filter(Boolean),
        active: form.active,
      }),
    onSuccess: () => {
      toast.success("Delivery location created")
      queryClient.invalidateQueries({ queryKey: ["admin-delivery-locations"] })
      setShowForm(false)
      setForm(EMPTY_FORM)
    },
    onError: () => toast.error("Failed to create location"),
  })

  const updateMutation = useMutation({
    mutationFn: () =>
      updateDeliveryLocation(editing!.id, {
        name: form.name,
        address: form.address,
        city: form.city,
        time_slots: form.time_slots_raw.split("\n").map((s) => s.trim()).filter(Boolean),
        active: form.active,
      }),
    onSuccess: () => {
      toast.success("Location updated")
      queryClient.invalidateQueries({ queryKey: ["admin-delivery-locations"] })
      setEditing(null)
      setShowForm(false)
      setForm(EMPTY_FORM)
    },
    onError: () => toast.error("Failed to update location"),
  })

  function startEdit(loc: Location) {
    setEditing(loc)
    setForm({
      name: loc.name,
      address: loc.address,
      city: loc.city,
      time_slots_raw: loc.time_slots.join("\n"),
      active: loc.active,
    })
    setShowForm(true)
  }

  function set(field: string, value: any) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const locations: Location[] = data?.data?.locations ?? []
  const isMutating = createMutation.isPending || updateMutation.isPending

  return (
    <DashboardShell>
      <DashboardHeader heading="Delivery Locations" text="Manage drop-off hubs where farmers deliver goods.">
        {!showForm && (
          <button
            onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true) }}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add Location
          </button>
        )}
      </DashboardHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Locations list */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
          ) : locations.length === 0 ? (
            <div className="border rounded-xl py-12 text-center space-y-2">
              <MapPin className="w-8 h-8 mx-auto text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No delivery locations yet.</p>
            </div>
          ) : (
            locations.map((loc) => (
              <div key={loc.id} className="border rounded-xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{loc.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${loc.active ? "bg-green-100 text-green-800" : "bg-muted text-muted-foreground"}`}>
                        {loc.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{loc.address}, {loc.city}</p>
                  </div>
                  <button onClick={() => startEdit(loc)} className="text-muted-foreground hover:text-foreground">
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
                {loc.time_slots?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {loc.time_slots.map((slot) => (
                      <span key={slot} className="text-xs border rounded px-2 py-0.5 text-muted-foreground">{slot}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Form panel */}
        {showForm && (
          <div className="border rounded-xl p-5 space-y-4 self-start">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">{editing ? "Edit Location" : "New Location"}</h2>
              <button onClick={() => { setShowForm(false); setEditing(null); setForm(EMPTY_FORM) }}>
                <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Surrey Complex"
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Address *</label>
                <input
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="Surrey Road"
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">City *</label>
                <input
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Harare"
                  className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Time Slots <span className="font-normal text-muted-foreground">(one per line, e.g. 08:00-10:00)</span>
                </label>
                <textarea
                  value={form.time_slots_raw}
                  onChange={(e) => set("time_slots_raw", e.target.value)}
                  rows={4}
                  placeholder={"08:00-10:00\n10:00-12:00\n14:00-16:00"}
                  className="w-full text-sm border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                />
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
            </div>

            <button
              onClick={() => editing ? updateMutation.mutate() : createMutation.mutate()}
              disabled={isMutating || !form.name || !form.address || !form.city}
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
            >
              {isMutating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {editing ? "Save Changes" : "Create Location"}
            </button>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
