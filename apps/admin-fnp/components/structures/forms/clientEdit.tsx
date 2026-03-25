"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { useForm, useWatch } from "react-hook-form"

import { updateClient, queryFarmProduceCategories, queryFarmProduceByCategory } from "@/lib/query"
import {
  EditApplicationUser,
  EditApplicationUserSchema,
  ApplicationUser,
  FarmProduceCategory,
  FarmProduce,
  FarmProduceCategoriesResponse,
  FarmProduceResponse,
} from "@/lib/schemas"
import { cn, slug } from "@/lib/utilities"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons/lucide"

import {
  clientTypes,
  provinces,
  scales,
  paymentTermsOptions
} from "@/components/structures/repository/data"

interface EditFormProps extends React.HTMLAttributes<HTMLDivElement> {
  client: ApplicationUser
}

export function EditForm({ client }: EditFormProps) {
  const form = useForm({
    defaultValues: {
      id: client?.id,
      name: client?.name,
      email: client?.email,
      address: client?.address,
      city: client?.city,
      province: client?.province,
      phone: client?.phone,
      primary_category_id: client?.primary_category_id,
      main_produce_id: client?.main_produce_id,
      other_produce_ids: client?.other_produce_ids || [],
      type: client?.type,
      scale: client?.scale,
      branches: client?.branches,
      short_description: client?.short_description,
      payment_terms: client?.payment_terms
    },
    resolver: zodResolver(EditApplicationUserSchema),
  })

  // Fetch farm produce categories
  const { data: categoriesData } = useQuery({
    queryKey: ["farm-produce-categories"],
    queryFn: async () => {
      const response = await queryFarmProduceCategories()
      return response.data as FarmProduceCategoriesResponse
    },
  })

  const categories = categoriesData?.data || []

  const selectedOtherProduceIds = useWatch({
    name: "other_produce_ids",
    control: form.control,
  })

  const selectedMainProduceId = useWatch({
    name: "main_produce_id",
    control: form.control,
  })

  const selectedCategoryId = form.watch("primary_category_id")

  // Find the selected category to get its slug
  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId)

  // Fetch produce for the selected category dynamically
  const { data: produceData } = useQuery({
    queryKey: ["farm-produce-by-category", selectedCategory?.slug],
    queryFn: async () => {
      const response = await queryFarmProduceByCategory(selectedCategory!.slug)
      return response.data as FarmProduceResponse
    },
    enabled: !!selectedCategory?.slug,
  })

  const produceItems = produceData?.data || []

  // For "Other Produce", fetch all produce grouped by category
  const [allProduceByCategory, setAllProduceByCategory] = useState<Record<string, FarmProduce[]>>({})

  useEffect(() => {
    const fetchAllProduce = async () => {
      const produceByCategory: Record<string, FarmProduce[]> = {}

      for (const category of categories) {
        try {
          const response = await queryFarmProduceByCategory(category.slug)
          const data = response.data as FarmProduceResponse
          produceByCategory[category.id] = data.data
        } catch (error) {
          console.error(`Failed to fetch produce for ${category.name}`, error)
        }
      }

      setAllProduceByCategory(produceByCategory)
    }

    if (categories.length > 0) {
      fetchAllProduce()
    }
  }, [categories])

  const [open, setOpen] = useState(false)

  const router = useRouter()

  const { mutate, isPending } = useMutation({
    mutationFn: updateClient,
    onSuccess: (data) => {
      toast({
        description: "Updated User Succesfully",
      })

      router.push(`/dashboard/farmnport/users`)
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        switch (error.code) {
          case "ERR_NETWORK":
            toast({
              description: "There seems to be a network error.",
              action: <ToastAction altText="Try again">Try again</ToastAction>,
            })
            break

          default:
            toast({
              title: "Uh oh!  client update failed.",
              description: "There was a problem with your request.",
              action: <ToastAction altText="Try again">Try again</ToastAction>,
            })
            break
        }
      }
    },
  })

  async function onSubmit(payload: EditApplicationUser) {
    payload.branches = Number(payload.branches)
    mutate(payload)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-12">
          {/* Basic Information Section */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
            <div>
              <h2 className="text-base/7 font-semibold text-gray-900">Basic Information</h2>
              <p className="mt-1 text-sm/6 text-gray-600">
                Primary details about the client including name, contact information, and category.
              </p>
            </div>

            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
              <div className="sm:col-span-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm/6 font-medium text-gray-900">Name</FormLabel>
                      <div className="mt-2">
                        <FormControl>
                          <Input
                            placeholder="Type client name"
                            className="block w-full rounded-md border-0 bg-white px-3 py-1.5 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="sm:col-span-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm/6 font-medium text-gray-900">Email address</FormLabel>
                      <div className="mt-2">
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="client@email.com"
                            className="block w-full rounded-md border-0 bg-white px-3 py-1.5 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="sm:col-span-3">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm/6 font-medium text-gray-900">Phone</FormLabel>
                      <div className="mt-2">
                        <FormControl>
                          <Input
                            placeholder="0771234567"
                            className="block w-full rounded-md border-0 bg-white px-3 py-1.5 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="sm:col-span-3">
                <FormField
                  control={form.control}
                  name="primary_category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm/6 font-medium text-gray-900">Category</FormLabel>
                      <div className="mt-2">
                        <Select onValueChange={field.onChange} defaultValue={client?.primary_category_id}>
                          <FormControl>
                            <SelectTrigger className="w-full rounded-md border-0 bg-white px-3 py-1.5 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="sm:col-span-4">
                <FormField
                  control={form.control}
                  name="main_produce_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm/6 font-medium text-gray-900">Main Produce</FormLabel>
                      <div className="mt-2">
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={client?.main_produce_id}
                          disabled={!selectedCategoryId}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full rounded-md border-0 bg-white px-3 py-1.5 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6">
                              <SelectValue placeholder={selectedCategoryId ? "Select produce" : "Select category first"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {produceItems?.map((produce: FarmProduce) => (
                              <SelectItem key={produce.id} value={produce.id}>
                                {produce.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-full">
                <FormField
                  control={form.control}
                  name="other_produce_ids"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm/6 font-medium text-gray-900">Other Produce</FormLabel>
                      <div className="mt-2">
                        <FormControl>
                          <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                              <div className="min-h-[2.5rem] rounded-md border-0 bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 cursor-pointer">
                                <div className="flex flex-wrap gap-1">
                                  {selectedOtherProduceIds && selectedOtherProduceIds.length > 0
                                    ? selectedOtherProduceIds.map((produceId: string) => {
                                      // Find the produce name from all produce
                                      let produceName = ""
                                      for (const categoryID in allProduceByCategory) {
                                        const produce = allProduceByCategory[categoryID].find(p => p.id === produceId)
                                        if (produce) {
                                          produceName = produce.name
                                          break
                                        }
                                      }

                                      if (produceName) {
                                        return (
                                          <Badge
                                            key={produceId}
                                            className="text-xs bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20 hover:bg-green-100 hover:text-green-800"
                                          >
                                            {produceName}
                                          </Badge>
                                        )
                                      }
                                      return null
                                    })
                                    : <span className="text-gray-400">Select additional produce...</span>}
                                </div>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-[320px] p-0">
                              <Command>
                                <CommandInput placeholder="Search produce..." />
                                <CommandList>
                                  <CommandEmpty>No results found.</CommandEmpty>
                                  {categories.map((category) => {
                                    const categoryProduce = allProduceByCategory[category.id] || []

                                    if (categoryProduce.length === 0) return null

                                    return (
                                      <CommandGroup key={category.id} heading={category.name}>
                                        {categoryProduce.map((produce) => {
                                          if (selectedMainProduceId !== produce.id) {
                                            return (
                                              <CommandItem
                                                key={produce.id}
                                                onSelect={() => {
                                                  const currentIds = selectedOtherProduceIds || []
                                                  if (!currentIds.includes(produce.id)) {
                                                    form.setValue("other_produce_ids", [...currentIds, produce.id])
                                                  } else {
                                                    form.setValue("other_produce_ids", currentIds.filter((id: string) => id !== produce.id))
                                                  }
                                                }}
                                              >
                                                {selectedOtherProduceIds?.includes(produce.id) && (
                                                  <Icons.check className="w-4 h-4 mr-2" />
                                                )}
                                                <span>{produce.name}</span>
                                              </CommandItem>
                                            )
                                          }
                                          return null
                                        })}
                                      </CommandGroup>
                                    )
                                  })}
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                      </div>
                      <p className="mt-3 text-sm/6 text-gray-600">Select any additional produce this client works with.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-full">
                <FormField
                  control={form.control}
                  name="short_description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm/6 font-medium text-gray-900">Description</FormLabel>
                      <div className="mt-2">
                        <FormControl>
                          <Textarea
                            placeholder="Write client description here"
                            rows={3}
                            className="block w-full rounded-md border-0 bg-white px-3 py-1.5 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <p className="mt-3 text-sm/6 text-gray-600">Brief description of the client.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Location & Business Details Section */}
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
            <div>
              <h2 className="text-base/7 font-semibold text-gray-900">Location & Business Details</h2>
              <p className="mt-1 text-sm/6 text-gray-600">
                Address and business operation information.
              </p>
            </div>

            <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
              <div className="col-span-full">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm/6 font-medium text-gray-900">Street address</FormLabel>
                      <div className="mt-2">
                        <FormControl>
                          <Input
                            placeholder="Street address"
                            className="block w-full rounded-md border-0 bg-white px-3 py-1.5 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="sm:col-span-2 sm:col-start-1">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm/6 font-medium text-gray-900">City</FormLabel>
                      <div className="mt-2">
                        <FormControl>
                          <Input
                            placeholder="Harare"
                            className="block w-full rounded-md border-0 bg-white px-3 py-1.5 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="sm:col-span-2">
                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm/6 font-medium text-gray-900">Province</FormLabel>
                      <div className="mt-2">
                        <Select onValueChange={field.onChange} defaultValue={client?.province}>
                          <FormControl>
                            <SelectTrigger className="w-full rounded-md border-0 bg-white px-3 py-1.5 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6">
                              <SelectValue placeholder="Province" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {provinces.map((province) => (
                              <SelectItem key={province} value={province}>
                                {province}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="sm:col-span-2">
                <FormField
                  control={form.control}
                  name="branches"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm/6 font-medium text-gray-900">Branches</FormLabel>
                      <div className="mt-2">
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1"
                            className="block w-full rounded-md border-0 bg-white px-3 py-1.5 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="sm:col-span-2">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm/6 font-medium text-gray-900">Type</FormLabel>
                      <div className="mt-2">
                        <Select onValueChange={field.onChange} defaultValue={client?.type}>
                          <FormControl>
                            <SelectTrigger className="w-full rounded-md border-0 bg-white px-3 py-1.5 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clientTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="sm:col-span-2">
                <FormField
                  control={form.control}
                  name="scale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm/6 font-medium text-gray-900">Scale</FormLabel>
                      <div className="mt-2">
                        <Select onValueChange={field.onChange} defaultValue={client?.scale}>
                          <FormControl>
                            <SelectTrigger className="w-full rounded-md border-0 bg-white px-3 py-1.5 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6">
                              <SelectValue placeholder="Select scale" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {scales.map((scale) => (
                              <SelectItem key={scale} value={scale}>
                                {scale}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="sm:col-span-2">
                <FormField
                  control={form.control}
                  name="payment_terms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="block text-sm/6 font-medium text-gray-900">Payment Terms</FormLabel>
                      <div className="mt-2">
                        <Select onValueChange={field.onChange} defaultValue={client?.payment_terms}>
                          <FormControl>
                            <SelectTrigger className="w-full rounded-md border-0 bg-white px-3 py-1.5 text-base text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm/6">
                              <SelectValue placeholder="Select terms" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {paymentTermsOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 mb-6 flex items-center justify-end gap-x-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm/6 font-semibold text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
            disabled={isPending}
          >
            {isPending && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}
            Save
          </button>
        </div>
      </form>
    </Form>
  )
}
