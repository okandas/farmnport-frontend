"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { adminGetChefListing, adminUpdateChefListing } from "@/lib/query"
import { cn } from "@/lib/utilities"
import { buttonVariants, Button } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MealPlanForm {
  name: string
  meals: string
  variants: { size: string; price: string }[]
}

interface AddOnForm {
  name: string
  price: string
}

export default function EditChefListingPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const id = params.id as string

  const [type, setType] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [inclusions, setInclusions] = useState("")
  const [maxGuests, setMaxGuests] = useState("")
  const [travelRadius, setTravelRadius] = useState("")
  const [price, setPrice] = useState("")
  const [minBudget, setMinBudget] = useState("")
  const [availability, setAvailability] = useState("calendar")
  const [deliveryZones, setDeliveryZones] = useState("")
  const [status, setStatus] = useState("")
  const [mealPlans, setMealPlans] = useState<MealPlanForm[]>([])
  const [addOns, setAddOns] = useState<AddOnForm[]>([])

  const { data, isLoading } = useQuery({
    queryKey: ["admin-chef-listing", id],
    queryFn: () => adminGetChefListing(id),
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    const l = data?.data
    if (l) {
      setType(l.type ?? "")
      setTitle(l.title ?? "")
      setDescription(l.description ?? "")
      setInclusions((l.inclusions ?? []).join(", "))
      setMaxGuests(l.max_guests ? String(l.max_guests) : "")
      setTravelRadius(l.travel_radius ? String(l.travel_radius) : "")
      setPrice(l.price ? (l.price / 100).toFixed(2) : "")
      setMinBudget(l.min_budget ? (l.min_budget / 100).toFixed(2) : "")
      setAvailability(l.availability ?? "calendar")
      setDeliveryZones((l.delivery_zones ?? []).join(", "))
      setStatus(l.status ?? "")
      setMealPlans((l.meal_plans ?? []).map((mp: { name: string; meals: number; variants: { size: string; price: number }[] }) => ({
        name: mp.name,
        meals: String(mp.meals),
        variants: mp.variants.map((v: { size: string; price: number }) => ({ size: v.size, price: (v.price / 100).toFixed(2) })),
      })))
      setAddOns((l.add_ons ?? []).map((a: { name: string; price: number }) => ({ name: a.name, price: (a.price / 100).toFixed(2) })))
    }
  }, [data])

  const { mutate, isPending } = useMutation({
    mutationFn: (update: Record<string, unknown>) => adminUpdateChefListing(id, update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chef-listing", id] })
      queryClient.invalidateQueries({ queryKey: ["admin-chef-listings"] })
      toast({ description: "Listing updated" })
      router.push(`/dashboard/chefs/listings/${id}`)
    },
    onError: () => toast({ description: "Failed to update", variant: "destructive" }),
  })

  function addMealPlan() {
    setMealPlans([...mealPlans, { name: "", meals: "", variants: [{ size: "Classic", price: "" }, { size: "PowerUp", price: "" }, { size: "XL", price: "" }] }])
  }

  function removeMealPlan(i: number) {
    setMealPlans(mealPlans.filter((_, idx) => idx !== i))
  }

  function updateMealPlan(i: number, field: "name" | "meals", value: string) {
    const updated = [...mealPlans]
    updated[i] = { ...updated[i], [field]: value }
    setMealPlans(updated)
  }

  function updateVariant(planIdx: number, varIdx: number, field: "size" | "price", value: string) {
    const updated = [...mealPlans]
    const variants = [...updated[planIdx].variants]
    variants[varIdx] = { ...variants[varIdx], [field]: value }
    updated[planIdx] = { ...updated[planIdx], variants }
    setMealPlans(updated)
  }

  function addAddOn() {
    setAddOns([...addOns, { name: "", price: "" }])
  }

  function removeAddOn(i: number) {
    setAddOns(addOns.filter((_, idx) => idx !== i))
  }

  function updateAddOn(i: number, field: "name" | "price", value: string) {
    const updated = [...addOns]
    updated[i] = { ...updated[i], [field]: value }
    setAddOns(updated)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    mutate({
      title,
      description,
      inclusions: inclusions.split(",").map((s) => s.trim()).filter(Boolean),
      max_guests: maxGuests ? parseInt(maxGuests) : 0,
      travel_radius: travelRadius ? parseInt(travelRadius) : 0,
      price: price ? Math.round(parseFloat(price) * 100) : 0,
      min_budget: minBudget ? Math.round(parseFloat(minBudget) * 100) : 0,
      availability,
      status,
      delivery_zones: deliveryZones.split(",").map((s) => s.trim()).filter(Boolean),
      meal_plans: mealPlans.map((mp) => ({
        name: mp.name,
        meals: parseInt(mp.meals) || 0,
        variants: mp.variants.map((v) => ({
          size: v.size,
          price: Math.round(parseFloat(v.price) * 100) || 0,
        })),
      })),
      add_ons: addOns.map((a) => ({
        name: a.name,
        price: Math.round(parseFloat(a.price) * 100) || 0,
      })),
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6 px-4 py-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="space-y-10 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Edit Listing</h1>
        </div>
        <Link href={`/dashboard/chefs/listings/${id}`} className={cn(buttonVariants({ variant: "ghost" }))}>
          <Icons.close className="w-4 h-4 mr-2" /> Close
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Listing Details</h2>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-6">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2" />
              </div>
              <div className="sm:col-span-6">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2" rows={4} />
              </div>
              <div className="sm:col-span-6">
                <Label htmlFor="inclusions">Inclusions (comma separated)</Label>
                <Input id="inclusions" value={inclusions} onChange={(e) => setInclusions(e.target.value)} className="mt-2" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="maxGuests">Max Guests</Label>
                <Input id="maxGuests" type="number" value={maxGuests} onChange={(e) => setMaxGuests(e.target.value)} className="mt-2" />
              </div>
              <div className="sm:col-span-2">
                <Label>Availability</Label>
                <Select onValueChange={setAvailability} value={availability}>
                  <SelectTrigger className="mt-2 w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calendar">Calendar</SelectItem>
                    <SelectItem value="contact">Contact for Dates</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Status</Label>
                <Select onValueChange={setStatus} value={status}>
                  <SelectTrigger className="mt-2 w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {type === "solo" && (
            <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
              <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Solo Chef Pricing</h2>
              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <Label htmlFor="price">Price (USD)</Label>
                  <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-2" />
                </div>
                <div className="sm:col-span-3">
                  <Label htmlFor="travelRadius">Travel Radius (km)</Label>
                  <Input id="travelRadius" type="number" value={travelRadius} onChange={(e) => setTravelRadius(e.target.value)} className="mt-2" />
                </div>
              </div>
            </div>
          )}

          {type === "catering" && (
            <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
              <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Catering Pricing</h2>
              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <Label htmlFor="minBudget">Minimum Budget (USD)</Label>
                  <Input id="minBudget" type="number" step="0.01" value={minBudget} onChange={(e) => setMinBudget(e.target.value)} className="mt-2" />
                </div>
              </div>
            </div>
          )}

          {type === "private_kitchen" && (
            <>
              <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Meal Plans</h2>
                  <Button type="button" variant="outline" size="sm" onClick={addMealPlan}>Add Plan</Button>
                </div>
                {mealPlans.map((plan, i) => (
                  <div key={i} className="mt-6 rounded-lg border p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Plan {i + 1}</h3>
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeMealPlan(i)}>
                        <Icons.close className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <Label>Plan Name</Label>
                        <Input value={plan.name} onChange={(e) => updateMealPlan(i, "name", e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label>Number of Meals</Label>
                        <Input type="number" value={plan.meals} onChange={(e) => updateMealPlan(i, "meals", e.target.value)} className="mt-1" />
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2 block">Variants (USD)</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {plan.variants.map((v, vi) => (
                          <div key={vi}>
                            <Label className="text-xs text-muted-foreground">{v.size}</Label>
                            <Input type="number" step="0.01" value={v.price} onChange={(e) => updateVariant(i, vi, "price", e.target.value)} className="mt-1" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Add-Ons</h2>
                  <Button type="button" variant="outline" size="sm" onClick={addAddOn}>Add Add-On</Button>
                </div>
                {addOns.map((addon, i) => (
                  <div key={i} className="mt-4 flex items-end gap-3">
                    <div className="flex-1">
                      <Label>Name</Label>
                      <Input value={addon.name} onChange={(e) => updateAddOn(i, "name", e.target.value)} className="mt-1" />
                    </div>
                    <div className="w-32">
                      <Label>Price (USD)</Label>
                      <Input type="number" step="0.01" value={addon.price} onChange={(e) => updateAddOn(i, "price", e.target.value)} className="mt-1" />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeAddOn(i)}>
                      <Icons.close className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="mt-6">
                  <Label htmlFor="deliveryZones">Delivery Zones (comma separated)</Label>
                  <Input id="deliveryZones" value={deliveryZones} onChange={(e) => setDeliveryZones(e.target.value)} className="mt-2" />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button type="button" onClick={() => router.push(`/dashboard/chefs/listings/${id}`)} className="text-sm/6 font-semibold text-gray-900 dark:text-white">Cancel</button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            {isPending && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}
            Update
          </button>
        </div>
      </form>
    </div>
  )
}
