"use client"

import Link from "next/link"
import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

import { adminCreateLot, queryUsers, queryFarmProduce, queryBreeds, queryFarmProduceStates } from "@/lib/query"
import { FileInput } from "@/components/structures/controls/file-input"
import { ImageModel } from "@/lib/schemas"
import { toast } from "@/components/ui/use-toast"
import { handleApiError ,
  handleFormErrors
} from "@/lib/error-handler"
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
import { SearchSelect } from "@/components/ui/search-select"

const LOT_UNITS = ["kg", "head", "unit", "tonne", "bag", "dozen", "litre"]

const inputClass = "block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500"

interface NewLotForm {
  client_id: string
  farm_produce_id: string
  breed_id: string
  type: string
  form: string
  quantity: number
  unit: string
  price_per_unit: number
  notes: string
  expires_at: string
  main_image: ImageModel[]
  images: ImageModel[]
}

export default function NewAdminLotPage() {
  const router = useRouter()
  const [selectedProduceId, setSelectedProduceId] = useState("")

  const form = useForm<NewLotForm>({
    defaultValues: {
      client_id: "",
      farm_produce_id: "",
      breed_id: "",
      type: "sell",
      form: "",
      quantity: 0,
      unit: "kg",
      price_per_unit: 0,
      notes: "",
      expires_at: "",
      main_image: [],
      images: [],
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: NewLotForm) => adminCreateLot({
      client_id: data.client_id,
      type: data.type,
      farm_produce_id: data.farm_produce_id,
      breed_id: data.breed_id || undefined,
      form: data.form,
      quantity: Number(data.quantity),
      unit: data.unit,
      price_per_unit_cents: Math.round(Number(data.price_per_unit) * 100),
      notes: data.notes || undefined,
      expires_at: new Date(data.expires_at).toISOString(),
      main_image: data.main_image?.[0] ?? undefined,
      images: data.images ?? [],
    }),
    onSuccess: () => {
      toast({ description: "Lot created successfully" })
      router.push("/dashboard/farmnport/lots")
    },
    onError: (error) => handleApiError(error, { context: "admin create lot" }),
  })

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">New Lot</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Post a lot on behalf of a client. Admin-created lots are auto-approved.
          </p>
        </div>
        <Link href="/dashboard/farmnport/lots" className={cn(buttonVariants({ variant: "ghost" }))}>
          <Icons.close className="w-4 h-4 mr-2" />Close
        </Link>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => mutate(data), (errors) => handleFormErrors(errors))}>
          <div className="space-y-12">

            {/* Photos */}
            <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
              <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
                <div>
                  <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Photos</h2>
                  <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Main photo and up to 5 additional images.</p>
                </div>
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white mb-2">Main photo</label>
                    <FormField control={form.control} name="main_image" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FileInput
                            id=""
                            fieldName="main_image"
                            value={field.value || []}
                            onChange={field.onChange}
                            maxImages={1}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div>
                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white mb-2">Additional photos <span className="text-gray-400 font-normal">(up to 5)</span></label>
                    <FormField control={form.control} name="images" render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <FileInput
                            id=""
                            fieldName="images"
                            value={field.value || []}
                            onChange={field.onChange}
                            maxImages={5}
                            showPlaceholders
                            thumbnailClassName="inline-flex flex-col overflow-hidden border border-gray-200 rounded-lg mt-2 me-2 relative bg-white shadow-sm"
                            imageClassName="flex items-center justify-center w-32 h-32 overflow-hidden bg-gray-50"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              </div>
            </div>

            {/* Lot Details */}
            <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
              <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
                <div>
                  <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Lot Details</h2>
                  <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Select the client and fill in the listing details.</p>
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
                                queryKey="users-select"
                                queryFn={(params) => queryUsers(params)}
                                getItems={(page) => page?.data?.data ?? []}
                                value={field.value}
                                onValueChange={field.onChange}
                                getValue={(u) => u.id}
                                getLabel={(u) => u.name}
                                placeholder="Select client"
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
                      <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Farm Produce</label>
                      <div className="mt-2">
                        <FormField control={form.control} name="farm_produce_id" render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <SearchSelect
                                queryKey="admin-lot-produce-select"
                                queryFn={(params) => queryFarmProduce(params)}
                                getItems={(page) => (page?.data?.data ?? []).filter((fp: any) => fp.lots_enabled)}
                                value={field.value}
                                onValueChange={(val) => { field.onChange(val); setSelectedProduceId(val); form.setValue("breed_id", "") }}
                                getValue={(item) => item.id}
                                getLabel={(item) => item.name}
                                placeholder="Select produce"
                                searchPlaceholder="Search produce..."
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
                      <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Variety / Breed <span className="text-gray-400 font-normal">(optional)</span></label>
                      <div className="mt-2">
                        <FormField control={form.control} name="breed_id" render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <SearchSelect
                                queryKey={["admin-lot-breed-select", selectedProduceId]}
                                queryFn={(params) => queryBreeds({ ...params, farm_produce_id: selectedProduceId })}
                                getItems={(page) => page?.data?.data ?? []}
                                value={field.value}
                                onValueChange={field.onChange}
                                getValue={(item) => item.id}
                                getLabel={(item) => item.name}
                                placeholder="Select breed"
                                searchPlaceholder="Search breeds..."
                                disabled={!selectedProduceId}
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
                      <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">State</label>
                      <div className="mt-2">
                        <FormField control={form.control} name="form" render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <SearchSelect
                                queryKey="farm-produce-states"
                                queryFn={(params) => queryFarmProduceStates(params)}
                                getItems={(page) => page?.data?.data ?? []}
                                value={field.value ?? ""}
                                onValueChange={field.onChange}
                                getLabel={(f: any) => f.name ?? ""}
                                getValue={(f: any) => f.name}
                                placeholder="Select state..."
                                searchPlaceholder="Search states..."
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
                      <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Unit</label>
                      <div className="mt-2">
                        <FormField control={form.control} name="unit" render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger></FormControl>
                              <SelectContent>
                                {LOT_UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                              </SelectContent>
                            </Select>
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

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button type="button" onClick={() => router.push("/dashboard/farmnport/lots")}
              className="text-sm/6 font-semibold text-gray-900 dark:text-white">Cancel</button>
            <button type="submit" disabled={isPending}
              className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
              {isPending && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}Create Lot
            </button>
          </div>
        </form>
      </Form>
    </div>
  )
}
