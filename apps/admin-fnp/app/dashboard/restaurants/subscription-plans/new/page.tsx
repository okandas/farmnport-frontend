"use client"

import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"

import { addSubscriptionPlan } from "@/lib/query"
import { FormRestaurantSubscriptionPlanSchema, FormRestaurantSubscriptionPlanModel } from "@/lib/schemas"
import { cn, centsToDollarsFormInputs, dollarsToCents } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { toast } from "@/components/ui/use-toast"
import { handleApiError } from "@/lib/error-handler"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const inputClass = "block w-full rounded-md bg-white px-3.5 py-2.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"

export default function NewSubscriptionPlanPage() {
  const router = useRouter()

  const form = useForm<FormRestaurantSubscriptionPlanModel>({
    defaultValues: {
      tier: "pro",
      name: "",
      description: "",
      price_cents: 0,
      vat_rate: 15.5,
      currency: "usd",
      status: "active",
    },
    resolver: zodResolver(FormRestaurantSubscriptionPlanSchema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: addSubscriptionPlan,
    onSuccess: () => {
      toast({ description: "Subscription plan created" })
      router.push("/dashboard/restaurants/subscription-plans")
    },
    onError: (error) => {
      handleApiError(error, { context: "subscription plan creation" })
    },
  })

  function onSubmit(data: FormRestaurantSubscriptionPlanModel) {
    mutate(data)
  }

  return (
    <div className="space-y-10 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Add Subscription Plan
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create a new subscription plan for restaurant locations.
          </p>
        </div>
        <Link
          href="/dashboard/restaurants/subscription-plans"
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          <Icons.close className="w-4 h-4 mr-2" />
          Close
        </Link>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
              Plan Details
            </h2>
            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
              Pricing is stored in cents. Price is ex-VAT — VAT is calculated on payment.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">

              <div className="sm:col-span-3">
                <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                  Tier
                </label>
                <div className="mt-2">
                  <FormField
                    control={form.control}
                    name="tier"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select tier" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="starter">Starter</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                  Status
                </label>
                <div className="mt-2">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                  Plan Name
                </label>
                <div className="mt-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="e.g. Pro — Per Location"
                            className={inputClass}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                  Currency
                </label>
                <div className="mt-2">
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="usd"
                            className={inputClass}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                  Price ($, ex. VAT)
                </label>
                <div className="mt-2">
                  <FormField
                    control={form.control}
                    name="price_cents"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="e.g. 50.00"
                            className={inputClass}
                            value={centsToDollarsFormInputs(field.value)}
                            onChange={(e) => field.onChange(dollarsToCents(parseFloat(e.target.value) || 0))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                  VAT Rate (%)
                </label>
                <div className="mt-2">
                  <FormField
                    control={form.control}
                    name="vat_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="e.g. 15.5"
                            className={inputClass}
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Live total preview */}
              {form.watch("price_cents") > 0 && (
                <div className="sm:col-span-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Total incl. VAT:{" "}
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${((form.watch("price_cents") * (1 + form.watch("vat_rate") / 100)) / 100).toFixed(2)}
                    </span>
                  </p>
                </div>
              )}

            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-x-6">
            <button
              type="button"
              onClick={() => router.push("/dashboard/restaurants/subscription-plans")}
              className="text-sm/6 font-semibold text-gray-900 dark:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
