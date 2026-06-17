"use client"

import { use } from "react"
import Link from "next/link"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

import { queryAdminLot, updateLot, approveLot, queryUsers } from "@/lib/query"
import { SearchSelect } from "@/components/ui/search-select"
import { toast } from "@/components/ui/use-toast"
import { handleApiError } from "@/lib/error-handler"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const LOT_UNITS = ["kg", "head", "unit", "tonne", "bag", "dozen", "litre"]

const inputClass = "block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500"
const readonlyClass = "block w-full rounded-md bg-gray-50 px-3 py-1.5 text-sm text-gray-700 outline outline-1 -outline-offset-1 outline-gray-200 dark:bg-white/5 dark:text-gray-300 dark:outline-white/10"

interface EditLotForm {
  client_id: string
  type: string
  form: string
  quantity: number
  unit: string
  price_per_unit: number
  notes: string
  expires_at: string
}

function capitalizeFirst(s?: string) {
  if (!s) return "—"
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default function EditLotPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)

  const { data: lotData, isLoading } = useQuery({
    queryKey: ["admin-lot", slug],
    queryFn: () => queryAdminLot(slug),
    refetchOnWindowFocus: false,
  })

  const lot = lotData?.data

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Icons.spinner className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!lot) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-red-600 dark:text-red-400">Lot not found.</p>
      </div>
    )
  }

  return <EditForm lot={lot} slug={slug} />
}

function EditForm({ lot, slug }: { lot: any; slug: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const form = useForm<EditLotForm>({
    defaultValues: {
      client_id: lot.client_id ?? "",
      type: lot.type ?? "",
      form: lot.form ?? "",
      quantity: lot.quantity ?? 0,
      unit: lot.unit ?? "kg",
      price_per_unit: lot.price_per_unit_cents ? lot.price_per_unit_cents / 100 : 0,
      notes: lot.notes ?? "",
      expires_at: lot.expires_at ? lot.expires_at.slice(0, 10) : "",
    },
  })

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: (data: EditLotForm) => updateLot(slug, {
      client_id: data.client_id,
      type: data.type,
      form: data.form,
      quantity: Number(data.quantity),
      unit: data.unit,
      price_per_unit_cents: Math.round(Number(data.price_per_unit) * 100),
      notes: data.notes,
      expires_at: new Date(data.expires_at).toISOString(),
    }),
    onSuccess: () => {
      toast({ description: "Lot updated" })
      router.push("/dashboard/farmnport/lots")
    },
    onError: (error) => handleApiError(error, { context: "lot update" }),
  })

  const { mutate: approve, isPending: isApproving } = useMutation({
    mutationFn: () => approveLot(slug),
    onSuccess: () => {
      toast({ description: "Lot approved and now live" })
      queryClient.invalidateQueries({ queryKey: ["admin-lot", slug] })
      queryClient.invalidateQueries({ queryKey: ["admin-lots"] })
    },
    onError: (error) => handleApiError(error, { context: "lot approval" }),
  })

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Edit Lot</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {lot.farm_produce?.name ?? lot.slug}{lot.breed ? ` — ${lot.breed.name}` : ""}
          </p>
        </div>
        <Link href="/dashboard/farmnport/lots" className={cn(buttonVariants({ variant: "ghost" }))}>
          <Icons.close className="w-4 h-4 mr-2" />Close
        </Link>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => save(data))}>
          <div className="space-y-12">

            {/* Read-only info */}
            <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
              <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
                <div>
                  <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Lot Info</h2>
                  <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Submitted details.</p>
                </div>
                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">

                    <div className="sm:col-span-3">
                      <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Client</label>
                      <div className="mt-2">
                        <FormField control={form.control} name="client_id" render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <SearchSelect
                                queryKey={["users-select", lot.client_id]}
                                queryFn={(params) => queryUsers({ ...params, id: lot.client_id })}
                                getItems={(page) => page?.data?.data ?? []}
                                value={field.value || ""}
                                onValueChange={field.onChange}
                                getValue={(u) => u.id}
                                getLabel={(u) => u.name}
                                placeholder="—"
                                searchPlaceholder="Search clients..."
                                clearable
                                capitalize
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Posted by</label>
                      <div className="mt-2"><div className={readonlyClass}>{lot.created_by === "admin" ? "Admin" : "Client"}</div></div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Produce</label>
                      <div className="mt-2"><div className={readonlyClass}>{capitalizeFirst(lot.farm_produce?.name)}</div></div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Variety / Breed</label>
                      <div className="mt-2"><div className={readonlyClass}>{lot.breed?.name ?? "—"}</div></div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Location</label>
                      <div className="mt-2">
                        <div className={readonlyClass}>
                          {[capitalizeFirst(lot.city), capitalizeFirst(lot.province)].filter(s => s !== "—").join(", ") || "—"}
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Status</label>
                      <div className="mt-2">
                        <div className={readonlyClass}>
                          <span className={lot.moderated ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>
                            {lot.moderated ? "Live" : "Pending Approval"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Slug</label>
                      <div className="mt-2"><div className={readonlyClass}>{lot.slug}</div></div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Editable fields */}
            <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
              <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
                <div>
                  <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Lot Details</h2>
                  <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Update the listing details.</p>
                </div>

                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">

                    <div className="sm:col-span-3">
                      <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Type</label>
                      <div className="mt-2">
                        <FormField control={form.control} name="type" render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                              <SelectContent>
                                <SelectItem value="sell">Selling</SelectItem>
                                <SelectItem value="request">Buying</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Unit</label>
                      <div className="mt-2">
                        <FormField control={form.control} name="unit" render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger></FormControl>
                              <SelectContent>
                                {LOT_UNITS.map((u) => (
                                  <SelectItem key={u} value={u}>{u}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">State</label>
                      <div className="mt-2">
                        <FormField control={form.control} name="form" render={({ field }) => (
                          <FormItem>
                            <FormControl><Input placeholder="e.g. Fresh, Feeder Steer" className={inputClass} {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Quantity</label>
                      <div className="mt-2">
                        <FormField control={form.control} name="quantity" render={({ field }) => (
                          <FormItem>
                            <FormControl><Input type="number" step="0.01" min="0" placeholder="e.g. 500" className={inputClass} {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Price per unit ($)</label>
                      <div className="mt-2">
                        <FormField control={form.control} name="price_per_unit" render={({ field }) => (
                          <FormItem>
                            <FormControl><Input type="number" step="0.01" min="0.01" placeholder="0.00" className={inputClass} {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Expires</label>
                      <div className="mt-2">
                        <FormField control={form.control} name="expires_at" render={({ field }) => (
                          <FormItem>
                            <FormControl><Input type="date" className={inputClass} {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                    <div className="sm:col-span-6">
                      <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Notes <span className="text-gray-400 font-normal">(optional)</span></label>
                      <div className="mt-2">
                        <FormField control={form.control} name="notes" render={({ field }) => (
                          <FormItem>
                            <FormControl><Textarea rows={3} placeholder="Optional notes for buyers..." className={inputClass} {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-6 flex items-center justify-between gap-x-6">
            <div>
              {!lot.moderated && (
                <button
                  type="button"
                  disabled={isApproving}
                  onClick={() => approve()}
                  className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApproving && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}
                  Approve & Go Live
                </button>
              )}
            </div>
            <div className="flex items-center gap-x-6">
              <button type="button" onClick={() => router.push("/dashboard/farmnport/lots")}
                className="text-sm/6 font-semibold text-gray-900 dark:text-white">Cancel</button>
              <button type="submit" disabled={isSaving}
                className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSaving && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}Save
              </button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}
