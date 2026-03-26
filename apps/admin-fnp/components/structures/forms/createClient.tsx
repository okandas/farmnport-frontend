"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { useForm, useWatch } from "react-hook-form"

import { createClient, queryFarmProduceCategories, queryFarmProduceByCategory } from "@/lib/query"
import {
  EditApplicationUser,
  EditApplicationUserSchema,
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

interface CreateFormProps extends React.HTMLAttributes<HTMLDivElement> {
  client: EditApplicationUser
}

export function CreateForm({ client }: CreateFormProps) {
  const form = useForm({
    defaultValues: {
      id: client?.id,
      name: client?.name,
      email: client?.email,
      address: client?.address,
      city: client?.city,
      province: client?.province,
      phone: client?.phone,
      type: client?.type,
      scale: client?.scale,
      primary_category_id: client?.primary_category_id,
      main_produce_id: client?.main_produce_id,
      other_produce_ids: client?.other_produce_ids || [],
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
    mutationFn: createClient,
    onSuccess: () => {
      toast({
        description: "Created User Succesfully",
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
    mutate(payload)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-[92%] gap-4 mx-auto mb-8"
      >
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormDescription>
                  This is the name that will be displayed on your profile and in
                  emails.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Email Here" {...field} />
                </FormControl>
                <FormDescription></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="short_description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Short Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Short Description" {...field} />
                </FormControl>
                <FormDescription>
                  Your company slogan or Short description of your entity
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Phone Number" {...field} />
                </FormControl>
                <FormDescription></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="primary_category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
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
                <FormDescription></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="main_produce_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Main Produce</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={!selectedCategoryId}
                >
                  <FormControl>
                    <SelectTrigger>
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
                <FormDescription></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="col-span-2">
            <FormField
              control={form.control}
              name="other_produce_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Produce</FormLabel>
                  <FormControl>
                    <Popover open={open} onOpenChange={setOpen}>
                      <PopoverTrigger asChild>
                        <div className="min-h-[2.5rem] rounded-md border px-3 py-2 text-sm cursor-pointer">
                          <div className="flex flex-wrap gap-1">
                            {selectedOtherProduceIds && selectedOtherProduceIds.length > 0
                              ? selectedOtherProduceIds.map((produceId: string) => {
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
                  <FormDescription>Select any additional produce this client works with.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Address" {...field} />
                </FormControl>
                <FormDescription></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="City" {...field} />
                </FormControl>
                <FormDescription></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Province</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={client?.province}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Province..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="overflow-visible max-h-44">
                    {provinces.map((province) => {
                      return (
                        <SelectItem key={province} value={province}>
                          {province}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <FormDescription></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={client?.type}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="What user type are you?" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="overflow-visible max-h-44">
                    {clientTypes.map((type) => {
                      return (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <FormDescription></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="scale"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scale</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={client?.scale}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="What is your scale ?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="overflow-visible max-h-44">
                      {scales.map((scale) => {
                        return (
                          <SelectItem key={scale} value={scale}>
                            {scale}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="branches"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Branches</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Branches" {...field} />
                </FormControl>
                <FormDescription>
                  {client?.type === "buyer"
                    ? "These are total the places of business you sell from ."
                    : "This are total places of business you supply to."}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="payment_terms"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Terms</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={client?.payment_terms}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment terms..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="overflow-visible max-h-44">
                    {paymentTermsOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription></FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <button
          type="submit"
          className={cn(buttonVariants(), "mt-5")}
          disabled={isPending}
        >
          {isPending && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}
          Submit
        </button>
      </form>
    </Form>
  )
}
