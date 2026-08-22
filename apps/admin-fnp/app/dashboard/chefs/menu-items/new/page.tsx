"use client"

import { useState } from "react"
import Link from "next/link"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import { adminCreateChefMenuItem, adminListChefs } from "@/lib/query"
import { cn, dollarsToCents } from "@/lib/utilities"
import { Button, buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function NewChefMenuItemPage() {
  const router = useRouter()
  const [chefId, setChefId] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [priceCents, setPriceCents] = useState("")
  const [sizes, setSizes] = useState<{ name: string; description: string; price_cents: string }[]>([])
  const [tags, setTags] = useState("")
  const [status, setStatus] = useState("active")

  const { data: chefsData } = useQuery({
    queryKey: ["admin-chefs-all"],
    queryFn: () => adminListChefs(),
    refetchOnWindowFocus: false,
  })

  const chefs = (chefsData?.data?.chefs as { id: string; name: string }[]) ?? []

  const { mutate, isPending } = useMutation({
    mutationFn: adminCreateChefMenuItem,
    onSuccess: () => {
      toast({ description: "Menu item created successfully" })
      router.push("/dashboard/chefs/menu-items")
    },
    onError: () => {
      toast({ description: "Failed to create menu item", variant: "destructive" })
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!chefId || !name) {
      toast({ description: "Please fill in all required fields", variant: "destructive" })
      return
    }
    mutate({
      chef_id: chefId,
      name,
      description,
      category,
      price_cents: dollarsToCents(parseFloat(priceCents || "0")),
      sizes: sizes.filter(s => s.name.trim()).map(s => ({
        name: s.name.trim(),
        description: s.description.trim(),
        price_cents: dollarsToCents(parseFloat(s.price_cents || "0")),
      })),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      status,
    })
  }

  return (
    <div className="space-y-10 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Add Menu Item
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create a new chef menu item.
          </p>
        </div>
        <Link
          href="/dashboard/chefs/menu-items"
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          <Icons.chevronLeft className="w-4 h-4 mr-2" />
          Back
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
            Menu Item Details
          </h2>
          <p className="mt-1 max-w-2xl text-sm/6 text-gray-600 dark:text-gray-400">
            Details for this menu item.
          </p>

          <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:border-t-gray-900/10 sm:pb-0 dark:border-white/10 dark:sm:divide-white/10 dark:sm:border-t-white/10">
            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label htmlFor="chefId" className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white">
                Chef *
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <select
                  id="chefId"
                  value={chefId}
                  onChange={(e) => setChefId(e.target.value)}
                  className="block w-full sm:max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">Select a chef</option>
                  {chefs.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white">
                Name *
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Grilled Chicken" className="sm:max-w-md" />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label htmlFor="description" className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white">
                Description
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe this menu item" rows={4} className="sm:max-w-2xl" />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label htmlFor="category" className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white">
                Category
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Frozen, Tots, Treats, Lunch Club" className="sm:max-w-md" />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label htmlFor="priceCents" className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white">
                Price ($)
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <Input id="priceCents" type="number" step="0.01" min="0" value={priceCents} onChange={(e) => setPriceCents(e.target.value)} placeholder="e.g. 8.00" className="sm:max-w-xs" />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <div>
                <label htmlFor="tags" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                  Tags
                </label>
                <p className="mt-1 text-xs text-gray-500">Comma separated</p>
              </div>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. gluten-free, carb-conscious" className="sm:max-w-md" />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label htmlFor="status" className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white">
                Status
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="block w-full sm:max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Sizes */}
        <div className="mt-12">
          <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
            Options / Variants
          </h2>
          <p className="mt-1 max-w-2xl text-sm/6 text-gray-600 dark:text-gray-400">
            Add options if this item has variants (e.g. 5 meals, 12 meals, 20 meals).
          </p>
          <div className="mt-4 space-y-2">
            {sizes.length > 0 && (
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                <div className="flex-1">Name</div>
                <div className="flex-1">Description</div>
                <div className="w-28">Price ($)</div>
                <div className="w-4" />
              </div>
            )}
            {sizes.map((size, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Option name (e.g. 5 meals)"
                  value={size.name}
                  onChange={(e) => {
                    const updated = [...sizes]
                    updated[index] = { ...updated[index], name: e.target.value }
                    setSizes(updated)
                  }}
                />
                <Input
                  placeholder="Description (e.g. $2.00 each)"
                  value={size.description}
                  onChange={(e) => {
                    const updated = [...sizes]
                    updated[index] = { ...updated[index], description: e.target.value }
                    setSizes(updated)
                  }}
                />
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Price ($)"
                  value={size.price_cents}
                  onChange={(e) => {
                    const updated = [...sizes]
                    updated[index] = { ...updated[index], price_cents: e.target.value }
                    setSizes(updated)
                  }}
                  className="w-28"
                />
                <button
                  type="button"
                  onClick={() => setSizes(sizes.filter((_, i) => i !== index))}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <Icons.close className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setSizes([...sizes, { name: "", description: "", price_cents: "" }])}
          >
            <Icons.add className="w-4 h-4 mr-1" />
            Add Option
          </Button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="button"
            onClick={() => router.push("/dashboard/chefs/menu-items")}
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
            Save
          </button>
        </div>
      </form>
    </div>
  )
}
