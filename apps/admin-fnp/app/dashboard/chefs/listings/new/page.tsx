"use client"

import { useState } from "react"
import Link from "next/link"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import { adminCreateChefListing, adminListChefs } from "@/lib/query"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
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

export default function NewChefListingPage() {
  const router = useRouter()

  const [chefId, setChefId] = useState("")
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
  const [mealPlans, setMealPlans] = useState<MealPlanForm[]>([])
  const [addOns, setAddOns] = useState<AddOnForm[]>([])

  const { data: chefsData } = useQuery({
    queryKey: ["admin-chefs-select"],
    queryFn: () => adminListChefs({ p: 1 }),
    refetchOnWindowFocus: false,
  })

  const chefs = (chefsData?.data?.chefs ?? []) as { id: string; name: string }[]

  const { mutate, isPending } = useMutation({
    mutationFn: adminCreateChefListing,
    onSuccess: () => {
      toast({ description: "Listing created successfully" })
      router.push("/dashboard/chefs/listings")
    },
    onError: () => {
      toast({ description: "Failed to create listing", variant: "destructive" })
    },
  })

  function addMealPlan() {
    setMealPlans([...mealPlans, { name: "", meals: "", variants: [{ size: "Classic", price: "" }, { size: "PowerUp", price: "" }, { size: "XL", price: "" }] }])
  }

  function removeMealPlan(i: number) {
    setMealPlans(mealPlans.filter((_, idx) => idx !== i))
  }

  function updateMealPlan(i: number, field: string, value: string) {
    const updated = [...mealPlans]
    ;(updated[i] as Record<string, unknown>)[field] = value
    setMealPlans(updated)
  }

  function updateVariant(planIdx: number, varIdx: number, field: string, value: string) {
    const updated = [...mealPlans]
    ;(updated[planIdx].variants[varIdx] as Record<string, unknown>)[field] = value
    setMealPlans(updated)
  }

  function addAddOn() {
    setAddOns([...addOns, { name: "", price: "" }])
  }

  function removeAddOn(i: number) {
    setAddOns(addOns.filter((_, idx) => idx !== i))
  }

  function updateAddOn(i: number, field: string, value: string) {
    const updated = [...addOns]
    ;(updated[i] as Record<string, unknown>)[field] = value
    setAddOns(updated)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!chefId || !type || !title) {
      toast({ description: "Chef, type, and title are required", variant: "destructive" })
      return
    }
    if (type === "solo" && !price) {
      toast({ description: "Price is required for solo listings", variant: "destructive" })
      return
    }
    if (type === "private_kitchen" && mealPlans.length === 0) {
      toast({ description: "At least one meal plan is required for private kitchen listings", variant: "destructive" })
      return
    }

    mutate({
      chef_id: chefId,
      type,
      title,
      description,
      inclusions: inclusions.split(",").map((s) => s.trim()).filter(Boolean),
      images: [],
      max_guests: maxGuests ? parseInt(maxGuests) : 0,
      travel_radius: travelRadius ? parseInt(travelRadius) : 0,
      price: price ? Math.round(parseFloat(price) * 100) : 0,
      min_budget: minBudget ? Math.round(parseFloat(minBudget) * 100) : 0,
      availability,
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

  return (
    <div className="space-y-10 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Create Listing
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Add a new chef listing.
          </p>
        </div>
        <Link
          href="/dashboard/chefs/listings"
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          <Icons.close className="w-4 h-4 mr-2" />
          Close
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-12">
          {/* Basic */}
          <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
              Listing Details
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <Label>Chef *</Label>
                <Select onValueChange={setChefId} value={chefId}>
                  <SelectTrigger className="mt-2 w-full">
                    <SelectValue placeholder="Select chef" />
                  </SelectTrigger>
                  <SelectContent>
                    {chefs.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-3">
                <Label>Type *</Label>
                <Select onValueChange={setType} value={type}>
                  <SelectTrigger className="mt-2 w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solo">Solo Chef</SelectItem>
                    <SelectItem value="catering">Catering</SelectItem>
                    <SelectItem value="private_kitchen">Private Kitchen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-6">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2" placeholder="e.g. Private Dinner for 2" />
              </div>
              <div className="sm:col-span-6">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-2" rows={4} />
              </div>
              <div className="sm:col-span-6">
                <Label htmlFor="inclusions">Inclusions (comma separated)</Label>
                <Input id="inclusions" value={inclusions} onChange={(e) => setInclusions(e.target.value)} className="mt-2" placeholder="e.g. 3-course meal, wine pairing, table setting" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="maxGuests">Max Guests</Label>
                <Input id="maxGuests" type="number" value={maxGuests} onChange={(e) => setMaxGuests(e.target.value)} className="mt-2" />
              </div>
              <div className="sm:col-span-2">
                <Label>Availability</Label>
                <Select onValueChange={setAvailability} value={availability}>
                  <SelectTrigger className="mt-2 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="calendar">Calendar</SelectItem>
                    <SelectItem value="contact">Contact for Dates</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Solo pricing */}
          {type === "solo" && (
            <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
              <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Solo Chef Pricing</h2>
              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <Label htmlFor="price">Price (USD) *</Label>
                  <Input id="price" type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-2" placeholder="e.g. 80.00" />
                </div>
                <div className="sm:col-span-3">
                  <Label htmlFor="travelRadius">Travel Radius (km)</Label>
                  <Input id="travelRadius" type="number" value={travelRadius} onChange={(e) => setTravelRadius(e.target.value)} className="mt-2" />
                </div>
              </div>
            </div>
          )}

          {/* Catering pricing */}
          {type === "catering" && (
            <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
              <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Catering Pricing</h2>
              <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <Label htmlFor="minBudget">Minimum Budget (USD)</Label>
                  <Input id="minBudget" type="number" step="0.01" value={minBudget} onChange={(e) => setMinBudget(e.target.value)} className="mt-2" placeholder="e.g. 200.00" />
                </div>
              </div>
            </div>
          )}

          {/* Private Kitchen */}
          {type === "private_kitchen" && (
            <>
              <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
                <div className="flex items-center justify-between">
                  <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Meal Plans *</h2>
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
                        <Input value={plan.name} onChange={(e) => updateMealPlan(i, "name", e.target.value)} className="mt-1" placeholder="e.g. 5 Meals" />
                      </div>
                      <div>
                        <Label>Number of Meals</Label>
                        <Input type="number" value={plan.meals} onChange={(e) => updateMealPlan(i, "meals", e.target.value)} className="mt-1" placeholder="e.g. 5" />
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2 block">Variants (USD)</Label>
                      <div className="grid grid-cols-3 gap-3">
                        {plan.variants.map((v, vi) => (
                          <div key={vi}>
                            <Label className="text-xs text-muted-foreground">{v.size}</Label>
                            <Input type="number" step="0.01" value={v.price} onChange={(e) => updateVariant(i, vi, "price", e.target.value)} className="mt-1" placeholder="0.00" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {mealPlans.length === 0 && (
                  <p className="mt-4 text-sm text-muted-foreground">No meal plans added yet.</p>
                )}
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
                      <Input value={addon.name} onChange={(e) => updateAddOn(i, "name", e.target.value)} className="mt-1" placeholder="e.g. Fresh pressed juice" />
                    </div>
                    <div className="w-32">
                      <Label>Price (USD)</Label>
                      <Input type="number" step="0.01" value={addon.price} onChange={(e) => updateAddOn(i, "price", e.target.value)} className="mt-1" placeholder="0.00" />
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeAddOn(i)}>
                      <Icons.close className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                <div className="mt-6">
                  <Label htmlFor="deliveryZones">Delivery Zones (comma separated)</Label>
                  <Input id="deliveryZones" value={deliveryZones} onChange={(e) => setDeliveryZones(e.target.value)} className="mt-2" placeholder="e.g. Avondale, Borrowdale, Mount Pleasant" />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="button"
            onClick={() => router.push("/dashboard/chefs/listings")}
            className="text-sm/6 font-semibold text-gray-900 dark:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
          >
            {isPending && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}
            Save
          </button>
        </div>
      </form>
    </div>
  )
}
