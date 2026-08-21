"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { adminGetChef, adminUpdateChef } from "@/lib/query"
import { cn } from "@/lib/utilities"
import { buttonVariants, Button } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { FileInput } from "@/components/structures/controls/file-input"
import { ImageModel } from "@/lib/schemas"

const CHEF_TYPES = [
  { value: "solo", label: "Solo Chef" },
  { value: "catering", label: "Catering" },
  { value: "private_kitchen", label: "Private Kitchen" },
]

export default function EditChefPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const id = params.id as string

  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [city, setCity] = useState("")
  const [serviceRadius, setServiceRadius] = useState("")
  const [profileImage, setProfileImage] = useState<ImageModel[]>([])


  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [enabledTypes, setEnabledTypes] = useState<Set<string>>(new Set())
  const [cuisines, setCuisines] = useState("")
  const [featured, setFeatured] = useState(false)
  const [serviceOptions, setServiceOptions] = useState("")
  const [portionSizes, setPortionSizes] = useState<{ name: string; details: string }[]>([])

  const [serviceAreas, setServiceAreas] = useState("")
  const [chefNotes, setChefNotes] = useState<{ name: string; value: string }[]>([])

  const { data, isLoading } = useQuery({
    queryKey: ["admin-chef", id],
    queryFn: () => adminGetChef(id),
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    const chef = data?.data
    if (chef) {
      setName(chef.name ?? "")
      setBio(chef.bio ?? "")
      setPhone(chef.phone ?? "")
      setEmail(chef.email ?? "")
      setCity(chef.city ?? "")
      setServiceRadius(chef.service_radius ? String(chef.service_radius) : "")
      setProfileImage(chef.profile_image ? [chef.profile_image] : [])

      setServiceOptions((chef.service_options ?? []).join(", "))
      setPortionSizes(chef.portion_sizes ?? [])

      setServiceAreas((chef.service_areas ?? []).join(", "))
      setChefNotes(chef.chef_notes ?? [])
      setBankName(chef.bank_name ?? "")
      setAccountNumber(chef.account_number ?? "")
      setEnabledTypes(new Set(chef.enabled_types ?? []))
      setCuisines((chef.cuisines ?? []).join(", "))
      setFeatured(chef.featured ?? false)
    }
  }, [data])

  const { mutate, isPending } = useMutation({
    mutationFn: (update: Record<string, unknown>) => adminUpdateChef(id, update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chef", id] })
      queryClient.invalidateQueries({ queryKey: ["admin-chefs"] })
      toast({ description: "Chef updated successfully" })
      router.push(`/dashboard/chefs`)
    },
    onError: () => {
      toast({ description: "Failed to update chef", variant: "destructive" })
    },
  })

  function toggleType(type: string) {
    setEnabledTypes((prev) => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !bio || !phone || !email || !city || enabledTypes.size === 0) {
      toast({ description: "Please fill in all required fields", variant: "destructive" })
      return
    }
    mutate({
      name,
      bio,
      phone,
      email,
      city,
      service_radius: serviceRadius ? parseInt(serviceRadius) : 0,
      profile_image: profileImage[0] || null,
      cuisines: cuisines.split(",").map((c) => c.trim()).filter(Boolean),
      enabled_types: Array.from(enabledTypes),
      bank_name: bankName,
      account_number: accountNumber,
      featured,
      service_options: serviceOptions.split(",").map((s) => s.trim()).filter(Boolean),
      portion_sizes: portionSizes.filter((p) => p.name),

      service_areas: serviceAreas.split(",").map((s) => s.trim()).filter(Boolean),
      chef_notes: chefNotes.filter((n) => n.name && n.value),
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
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Edit Chef
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Update chef profile details.
          </p>
        </div>
        <Link
          href="/dashboard/chefs"
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          <Icons.chevronLeft className="w-4 h-4 mr-2" />
          Back
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Chef Information */}
        <div>
          <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
            Chef Information
          </h2>

          <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:border-t-gray-900/10 sm:pb-0 dark:border-white/10 dark:sm:divide-white/10 dark:sm:border-t-white/10">
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white">
                Name *
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="sm:max-w-md" />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label htmlFor="bio" className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white">
                Bio *
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="sm:max-w-2xl" />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label htmlFor="phone" className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white">
                Phone *
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="sm:max-w-md" />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white">
                Email *
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="sm:max-w-md" />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label htmlFor="city" className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white">
                City *
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="sm:max-w-md" />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label htmlFor="serviceRadius" className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white">
                Service Radius (km)
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <Input id="serviceRadius" type="number" value={serviceRadius} onChange={(e) => setServiceRadius(e.target.value)} className="sm:max-w-md" />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label htmlFor="cuisines" className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white">
                Cuisines
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <Input id="cuisines" value={cuisines} onChange={(e) => setCuisines(e.target.value)} className="sm:max-w-md" />
                <p className="mt-1 text-xs text-gray-500">Comma separated</p>
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white">
                Featured
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0 sm:pt-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="rounded" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Show as featured chef</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Image & Gallery */}
        {/* Profile Image */}
        <div className="mt-12">
          <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
            Chef or Business Photo
          </h2>
          <p className="mt-1 max-w-2xl text-sm/6 text-gray-600 dark:text-gray-400">
            Main profile photo for the chef or business.
          </p>

          <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:border-t-gray-900/10 sm:pb-0 dark:border-white/10 dark:sm:divide-white/10 dark:sm:border-t-white/10">
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <div>
                <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                  Photo
                </label>
              </div>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <FileInput
                  id={id}
                  fieldName="front_label"
                  entityType="chef"
                  value={profileImage}
                  onChange={setProfileImage}
                  thumbnailClassName="inline-flex flex-col overflow-hidden border border-gray-200 rounded-lg bg-white shadow-sm"
                  imageClassName="flex items-center justify-center w-40 h-56 overflow-hidden bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Chef Types */}
        <div className="mt-12">
          <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:border-t-gray-900/10 sm:pb-0 dark:border-white/10 dark:sm:divide-white/10 dark:sm:border-t-white/10">
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white">
                Chef Types *
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0 flex flex-wrap gap-2">
                {CHEF_TYPES.map((type) => {
                  const isSelected = enabledTypes.has(type.value)
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => toggleType(type.value)}
                      className={cn(
                        "inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                        isSelected
                          ? "bg-green-600 text-white hover:bg-green-500"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20"
                      )}
                    >
                      {type.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="mt-12">
          <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
            Bank Details
          </h2>
          <p className="mt-1 max-w-2xl text-sm/6 text-gray-600 dark:text-gray-400">
            For payouts after completed bookings.
          </p>

          <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:border-t-gray-900/10 sm:pb-0 dark:border-white/10 dark:sm:divide-white/10 dark:sm:border-t-white/10">
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label htmlFor="bankName" className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white">
                Bank Name
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <Input id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g. CABS" className="sm:max-w-md" />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label htmlFor="accountNumber" className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white">
                Account Number
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <Input id="accountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="Account number" className="sm:max-w-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Service Options & Areas */}
        <div className="mt-12">
          <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
            Services & Areas
          </h2>
          <p className="mt-1 max-w-2xl text-sm/6 text-gray-600 dark:text-gray-400">
            What the chef offers and where they operate.
          </p>

          <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:border-t-gray-900/10 sm:pb-0 dark:border-white/10 dark:sm:divide-white/10 dark:sm:border-t-white/10">
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <div>
                <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Service Options</label>
                <p className="mt-1 text-xs text-gray-500">Comma separated</p>
              </div>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <Input value={serviceOptions} onChange={(e) => setServiceOptions(e.target.value)} placeholder="e.g. Original, Gluten Free, Vegetarian" className="sm:max-w-md" />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <div>
                <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Service Areas</label>
                <p className="mt-1 text-xs text-gray-500">Comma separated</p>
              </div>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <Input value={serviceAreas} onChange={(e) => setServiceAreas(e.target.value)} placeholder="e.g. Avondale, Borrowdale, Mount Pleasant" className="sm:max-w-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Portion Sizes */}
        <div className="mt-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                Portion Sizes
              </h2>
              <p className="mt-1 max-w-2xl text-sm/6 text-gray-600 dark:text-gray-400">
                Size options with nutritional or pricing details.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPortionSizes([...portionSizes, { name: "", details: "" }])}
            >
              Add Size
            </Button>
          </div>

          <div className="mt-6 space-y-3">
            {portionSizes.map((size, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-1/3">
                  <Input
                    value={size.name}
                    onChange={(e) => {
                      const updated = [...portionSizes]
                      updated[i] = { ...updated[i], name: e.target.value }
                      setPortionSizes(updated)
                    }}
                    placeholder="e.g. Classic"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    value={size.details}
                    onChange={(e) => {
                      const updated = [...portionSizes]
                      updated[i] = { ...updated[i], details: e.target.value }
                      setPortionSizes(updated)
                    }}
                    placeholder="e.g. 100g protein, 100g carbs, 100g veg"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setPortionSizes(portionSizes.filter((_, idx) => idx !== i))}
                >
                  <Icons.close className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {portionSizes.length === 0 && (
              <p className="text-sm text-muted-foreground">No portion sizes added yet.</p>
            )}
          </div>
        </div>

        {/* Chef Notes */}
        <div className="mt-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                Chef Notes
              </h2>
              <p className="mt-1 max-w-2xl text-sm/6 text-gray-600 dark:text-gray-400">
                Policies, terms, and other info shown on the chef profile.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setChefNotes([...chefNotes, { name: "", value: "" }])}
            >
              Add Note
            </Button>
          </div>

          <div className="mt-6 space-y-3">
            {chefNotes.map((note, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-1/3">
                  <Input
                    value={note.name}
                    onChange={(e) => {
                      const updated = [...chefNotes]
                      updated[i] = { ...updated[i], name: e.target.value }
                      setChefNotes(updated)
                    }}
                    placeholder="e.g. Plan Validity"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    value={note.value}
                    onChange={(e) => {
                      const updated = [...chefNotes]
                      updated[i] = { ...updated[i], value: e.target.value }
                      setChefNotes(updated)
                    }}
                    placeholder="e.g. 90 days from purchase"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setChefNotes(chefNotes.filter((_, idx) => idx !== i))}
                >
                  <Icons.close className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {chefNotes.length === 0 && (
              <p className="text-sm text-muted-foreground">No notes added yet.</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/chefs`)}
            className="text-sm/6 font-semibold text-gray-900 dark:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-500 dark:shadow-none dark:hover:bg-green-400 dark:focus-visible:outline-green-500"
          >
            {isPending && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}
            Update
          </button>
        </div>
      </form>
    </div>
  )
}
