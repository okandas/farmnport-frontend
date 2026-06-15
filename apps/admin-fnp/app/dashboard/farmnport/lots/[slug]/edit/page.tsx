"use client"

import { use } from "react"
import Link from "next/link"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

import { queryAdminLot, updateLot } from "@/lib/query"
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

interface EditLotForm {
  type: string
  form: string
  quantity_kg: number
  price_per_kg: number
  notes: string
  expires_at: string
}

export default function EditLotPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter()
  const { slug } = use(params)

  const { data: lotData, isLoading } = useQuery({
    queryKey: ["admin-lot", slug],
    queryFn: () => queryAdminLot(slug),
  })

  const lot = lotData?.data

  const form = useForm<EditLotForm>({
    values: lot ? {
      type: lot.type,
      form: lot.form,
      quantity_kg: lot.quantity_kg,
      price_per_kg: lot.price_per_kg_cents ? lot.price_per_kg_cents / 100 : 0,
      notes: lot.notes ?? "",
      expires_at: lot.expires_at ? lot.expires_at.slice(0, 10) : "",
    } : undefined,
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: EditLotForm) => updateLot(slug, {
      type: data.type,
      form: data.form,
      quantity_kg: Number(data.quantity_kg),
      price_per_kg_cents: Math.round(Number(data.price_per_kg) * 100),
      notes: data.notes,
      expires_at: new Date(data.expires_at).toISOString(),
    }),
    onSuccess: () => {
      toast({ description: "Lot updated successfully" })
      router.push("/dashboard/farmnport/lots")
    },
    onError: (error) => handleApiError(error, { context: "lot update" }),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Icons.spinner className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!lot) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-red-600 dark:text-red-400">Lot not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Edit Lot
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {lot.farm_produce?.name ?? lot.slug}{lot.breed ? ` — ${lot.breed.name}` : ""}
          </p>
        </div>
        <Link href="/dashboard/farmnport/lots" className={cn(buttonVariants({ variant: "ghost" }))}>
          <Icons.close className="w-4 h-4 mr-2" />
          Close
        </Link>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((data) => mutate(data))}>
          <div className="space-y-12">
            <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
              <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Lot Details</h2>
              <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
                Update the listing details for this lot.
              </p>

              <div className="mt-10 space-y-8">

                {/* Type */}
                <div className="px-1">
                  <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Type</label>
                  <div className="mt-2">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="sell">Selling</SelectItem>
                              <SelectItem value="request">Buying</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Form/State */}
                <div className="px-1">
                  <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">State</label>
                  <div className="mt-2">
                    <FormField
                      control={form.control}
                      name="form"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="e.g. Fresh, Dried, Powder" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div className="px-1">
                  <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Quantity (kg)</label>
                  <div className="mt-2">
                    <FormField
                      control={form.control}
                      name="quantity_kg"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" placeholder="e.g. 500" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Price */}
                <div className="px-1">
                  <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Price per kg ($)</label>
                  <div className="mt-2">
                    <FormField
                      control={form.control}
                      name="price_per_kg"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input type="number" step="0.01" min="0" placeholder="Leave 0 for negotiable" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <p className="mt-3 text-sm/6 text-gray-600 dark:text-gray-400">Leave 0 for negotiable.</p>
                </div>

                {/* Expires At */}
                <div className="px-1">
                  <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Expires</label>
                  <div className="mt-2">
                    <FormField
                      control={form.control}
                      name="expires_at"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div className="px-1">
                  <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Notes</label>
                  <div className="mt-2">
                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea rows={4} placeholder="Optional notes for buyers..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button
              type="button"
              onClick={() => router.push("/dashboard/farmnport/lots")}
              className="text-sm/6 font-semibold text-gray-900 dark:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:hover:bg-indigo-400"
            >
              {isPending && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}
              Save
            </button>
          </div>
        </form>
      </Form>
    </div>
  )
}
