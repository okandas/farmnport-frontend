"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

import { adminGetChefMenu, adminUpdateChefMenu, adminListChefs, adminListChefMenuItems } from "@/lib/query"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { toast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"

interface MenuItemOption {
  id: string
  name: string
  description: string
}

export default function EditChefMenuPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const id = params.id as string

  const [chefId, setChefId] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [label, setLabel] = useState("")
  const [note, setNote] = useState("")
  const [notice, setNotice] = useState("")
  const [status, setStatus] = useState("active")
  const [selectedItems, setSelectedItems] = useState<{ id: string; name: string }[]>([])
  const [search, setSearch] = useState("")

  const { data: chefsData } = useQuery({
    queryKey: ["admin-chefs-all"],
    queryFn: () => adminListChefs(),
    refetchOnWindowFocus: false,
  })

  const chefs = (chefsData?.data?.chefs as { id: string; name: string }[]) ?? []

  const { data, isLoading } = useQuery({
    queryKey: ["admin-chef-menu", id],
    queryFn: () => adminGetChefMenu(id),
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    const menu = data?.data?.data
    if (menu) {
      setChefId(menu.chef_id ?? "")
      setName(menu.name ?? "")
      setDescription(menu.description ?? "")
      setLabel(menu.label ?? "")
      setNote(menu.note ?? "")
      setNotice(menu.notice ?? "")
      setStatus(menu.status ?? "active")
      setSelectedItems((menu.items ?? []).map((i: { item_id: string; item_name: string }) => ({
        id: i.item_id,
        name: i.item_name,
      })))
    }
  }, [data])

  const { data: itemsData } = useQuery({
    queryKey: ["admin-chef-menu-items-by-chef", chefId],
    queryFn: () => adminListChefMenuItems({ chef_id: chefId }),
    enabled: !!chefId,
    refetchOnWindowFocus: false,
  })

  const catalogItems = (itemsData?.data?.data as MenuItemOption[]) ?? []

  const selectedIds = new Set(selectedItems.map((i) => i.id))
  const availableItems = catalogItems.filter(
    (item) => !selectedIds.has(item.id) && item.name.toLowerCase().includes(search.toLowerCase())
  )

  function addItem(item: MenuItemOption) {
    setSelectedItems((prev) => [...prev, { id: item.id, name: item.name }])
  }

  function removeItem(itemId: string) {
    setSelectedItems((prev) => prev.filter((i) => i.id !== itemId))
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (update: Record<string, unknown>) => adminUpdateChefMenu(id, update),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chef-menu", id] })
      queryClient.invalidateQueries({ queryKey: ["admin-chef-menus"] })
      toast({ description: "Menu updated successfully" })
      router.push("/dashboard/chefs/menus")
    },
    onError: () => {
      toast({ description: "Failed to update menu", variant: "destructive" })
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
      label,
      note,
      notice,
      items: selectedItems.map((item) => ({ item_id: item.id, item_name: item.name })),
      status,
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
            Edit Menu
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Update menu details.
          </p>
        </div>
        <Link
          href="/dashboard/chefs/menus"
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          <Icons.chevronLeft className="w-4 h-4 mr-2" />
          Back
        </Link>
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
            Menu Details
          </h2>

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
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="sm:max-w-md" />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label htmlFor="description" className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white">
                Description
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Daily Deliveries" className="sm:max-w-md" />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label htmlFor="label" className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white">
                Label
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. SET MENU 4th - 7th August" className="sm:max-w-md" />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label htmlFor="note" className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white">
                Note
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Available in gluten free, low carb or vegetarian" className="sm:max-w-md" />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
              <label htmlFor="notice" className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white">
                Notice
              </label>
              <div className="mt-2 sm:col-span-2 sm:mt-0">
                <Input id="notice" value={notice} onChange={(e) => setNotice(e.target.value)} placeholder="e.g. CLOSED from Monday 10th - Friday 14th" className="sm:max-w-md" />
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

        {/* Transfer box */}
        <div className="mt-12">
          <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
            Menu Items
          </h2>
          <p className="mt-1 max-w-2xl text-sm/6 text-gray-600 dark:text-gray-400">
            Select items from the catalog to include in this menu.
          </p>

          {!chefId ? (
            <p className="mt-6 text-sm text-muted-foreground">Select a chef first to see their menu items.</p>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Left — selected items */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  On this menu ({selectedItems.length})
                </p>
                <div className="h-[300px] overflow-y-auto space-y-2">
                  {selectedItems.length === 0 ? (
                    <div className="flex items-center justify-center h-[200px] text-sm text-muted-foreground">
                      No items yet
                    </div>
                  ) : (
                    selectedItems.map((item) => (
                      <div
                        key={item.id}
                        className="group flex items-center justify-between rounded-lg bg-green-50/50 dark:bg-green-900/10 px-4 py-3"
                      >
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                        >
                          <Icons.close className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right — catalog */}
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Catalog
                </p>
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search items..."
                  className="mb-3"
                />
                <div className="h-[300px] overflow-y-auto space-y-1">
                  {availableItems.length === 0 ? (
                    <div className="flex items-center justify-center h-[160px] text-sm text-muted-foreground">
                      {catalogItems.length === 0 ? "No menu items for this chef." : "No matching items."}
                    </div>
                  ) : (
                    availableItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => addItem(item)}
                        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm text-gray-600 dark:text-gray-400 hover:bg-muted/50 transition-colors"
                      >
                        <Icons.add className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{item.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-x-6">
          <button
            type="button"
            onClick={() => router.push("/dashboard/chefs/menus")}
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
