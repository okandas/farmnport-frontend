"use client"

import { useState } from "react"
import Link from "next/link"
import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import { adminCreateChef } from "@/lib/query"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const CHEF_TYPES = [
  { value: "solo", label: "Solo Chef" },
  { value: "catering", label: "Catering" },
  { value: "private_kitchen", label: "Private Kitchen" },
]

export default function NewChefPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [city, setCity] = useState("")
  const [serviceRadius, setServiceRadius] = useState("")
  const [profileImage, setProfileImage] = useState("")
  const [instagram, setInstagram] = useState("")
  const [facebook, setFacebook] = useState("")
  const [website, setWebsite] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [enabledTypes, setEnabledTypes] = useState<Set<string>>(new Set())
  const [cuisines, setCuisines] = useState("")

  const { mutate, isPending } = useMutation({
    mutationFn: adminCreateChef,
    onSuccess: () => {
      toast({ description: "Chef created successfully" })
      router.push("/dashboard/chefs")
    },
    onError: () => {
      toast({ description: "Failed to create chef", variant: "destructive" })
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
      profile_image: profileImage,
      gallery: [],
      cuisines: cuisines.split(",").map((c) => c.trim()).filter(Boolean),
      enabled_types: Array.from(enabledTypes),
      bank_name: bankName,
      account_number: accountNumber,
      social_links: {
        instagram,
        facebook,
        website,
      },
    })
  }

  return (
    <div className="space-y-10 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Add Chef
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create a new chef profile.
          </p>
        </div>
        <Link
          href="/dashboard/chefs"
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          <Icons.close className="w-4 h-4 mr-2" />
          Close
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-12">
          {/* Basic Info */}
          <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
              Chef Information
            </h2>
            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
              Profile details for the chef.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2" placeholder="Chef name" />
              </div>
              <div className="sm:col-span-3">
                <Label htmlFor="city">City *</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} className="mt-2" placeholder="e.g. Harare" />
              </div>
              <div className="sm:col-span-6">
                <Label htmlFor="bio">Bio *</Label>
                <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} className="mt-2" placeholder="Chef bio / description" rows={4} />
              </div>
              <div className="sm:col-span-3">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-2" placeholder="+263..." />
              </div>
              <div className="sm:col-span-3">
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2" placeholder="chef@email.com" />
              </div>
              <div className="sm:col-span-3">
                <Label htmlFor="serviceRadius">Service Radius (km)</Label>
                <Input id="serviceRadius" type="number" value={serviceRadius} onChange={(e) => setServiceRadius(e.target.value)} className="mt-2" placeholder="e.g. 30" />
              </div>
              <div className="sm:col-span-3">
                <Label htmlFor="profileImage">Profile Image URL</Label>
                <Input id="profileImage" value={profileImage} onChange={(e) => setProfileImage(e.target.value)} className="mt-2" placeholder="https://..." />
              </div>
              <div className="sm:col-span-6">
                <Label htmlFor="cuisines">Cuisines (comma separated)</Label>
                <Input id="cuisines" value={cuisines} onChange={(e) => setCuisines(e.target.value)} className="mt-2" placeholder="e.g. African, Continental, Italian" />
              </div>
            </div>
          </div>

          {/* Chef Types */}
          <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
              Chef Types *
            </h2>
            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
              Select which services this chef offers.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {CHEF_TYPES.map((type) => {
                const isSelected = enabledTypes.has(type.value)
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => toggleType(type.value)}
                    className={cn(
                      "inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                      isSelected
                        ? "bg-indigo-600 text-white hover:bg-indigo-500"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20"
                    )}
                  >
                    {type.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Social Links */}
          <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
              Social Links
            </h2>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input id="instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="mt-2" placeholder="@handle" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input id="facebook" value={facebook} onChange={(e) => setFacebook(e.target.value)} className="mt-2" placeholder="URL or handle" />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} className="mt-2" placeholder="https://..." />
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
              Bank Details
            </h2>
            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
              For payouts after completed bookings.
            </p>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input id="bankName" value={bankName} onChange={(e) => setBankName(e.target.value)} className="mt-2" placeholder="e.g. CABS" />
              </div>
              <div className="sm:col-span-3">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input id="accountNumber" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="mt-2" placeholder="Account number" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="button"
            onClick={() => router.push("/dashboard/chefs")}
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
