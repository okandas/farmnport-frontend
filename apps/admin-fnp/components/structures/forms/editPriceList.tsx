"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { format } from "date-fns"
import { useForm, useWatch } from "react-hook-form"
import { useDebounce } from "use-debounce"

import { queryUsers, updateClientProductPriceList } from "@/lib/query"
import {
  ApplicationUser,
  ProducerPriceList,
  ProducerPriceListSchema,
} from "@/lib/schemas"
import {centsToDollarsFormInputs, cn, createPriceListPayload} from "@/lib/utilities"

import { Button, buttonVariants } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons/lucide"
import { units } from "@/components/structures/repository/data"

interface EditProductPriceFormProps
  extends React.HTMLAttributes<HTMLDivElement> {
  priceList: ProducerPriceList
}

export function EditProductPriceForm({ priceList }: EditProductPriceFormProps) {
  const form = useForm({
    defaultValues: {
      id: priceList.id,
      effectiveDate: new Date(),
      client_id: priceList.client_id,
      client_name: priceList.client_name,
      client_specialization: priceList.client_specialization || "livestock",
      beef: {
        super: {
          code: priceList.beef.super.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.beef.super.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.beef.super.pricing.delivered,
            ),
          },
        },
        choice: {
          code: priceList.beef.choice.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.beef.choice.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.beef.choice.pricing.delivered,
            ),
          },
        },
        commercial: {
          code: priceList.beef.commercial.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.beef.commercial.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.beef.commercial.pricing.delivered,
            ),
          },
        },
        economy: {
          code: priceList.beef.economy.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.beef.economy.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.beef.economy.pricing.delivered,
            ),
          },
        },
        manufacturing: {
          code: priceList.beef.manufacturing.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.beef.manufacturing.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.beef.manufacturing.pricing.delivered,
            ),
          },
        },
        condemned: {
          code: priceList.beef.condemned.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.beef.condemned.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.beef.condemned.pricing.delivered,
            ),
          },
        },

        detained: priceList.beef.detained,
        hasPrice: priceList.beef.hasPrice,
        hasCollectedPrice: priceList.beef.hasCollectedPrice,
      },
      lamb: {
        super_premium: {
          code: priceList.lamb.super_premium.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.lamb.super_premium.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.lamb.super_premium.pricing.delivered,
            ),
          },
        },
        choice: {
          code: priceList.lamb.choice.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.lamb.choice.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.lamb.choice.pricing.delivered,
            ),
          },
        },
        standard: {
          code: priceList.lamb.standard.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.lamb.standard.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.lamb.standard.pricing.delivered,
            ),
          },
        },
        inferior: {
          code: priceList.lamb.inferior.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.lamb.inferior.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.lamb.inferior.pricing.delivered,
            ),
          },
        },
        hasPrice: priceList.lamb.hasPrice,
        hasCollectedPrice: priceList.lamb.hasCollectedPrice,
      },
      mutton: {
        super: {
          code: priceList.mutton.super.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.mutton.super.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.mutton.super.pricing.delivered,
            ),
          },
        },
        choice: {
          code: priceList.mutton.choice.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.mutton.choice.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.mutton.choice.pricing.delivered,
            ),
          },
        },
        standard: {
          code: priceList.mutton.standard.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.mutton.standard.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.mutton.standard.pricing.delivered,
            ),
          },
        },
        ordinary: {
          code: priceList.mutton.ordinary.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.mutton.ordinary.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.mutton.ordinary.pricing.delivered,
            ),
          },
        },
        inferior: {
          code: priceList.mutton.inferior.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.mutton.inferior.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.mutton.inferior.pricing.delivered,
            ),
          },
        },
        hasPrice: priceList.mutton.hasPrice,
        hasCollectedPrice: priceList.mutton.hasCollectedPrice,
      },
      goat: {
        super: {
          code: priceList.goat.super.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.goat.super.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.goat.super.pricing.delivered,
            ),
          },
        },
        choice: {
          code: priceList.goat.choice.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.goat.choice.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.goat.choice.pricing.delivered,
            ),
          },
        },
        standard: {
          code: priceList.goat.standard.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.goat.standard.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.goat.standard.pricing.delivered,
            ),
          },
        },
        inferior: {
          code: priceList.goat.inferior.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.goat.inferior.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.goat.inferior.pricing.delivered,
            ),
          },
        },
        hasPrice: priceList.goat.hasPrice,
        hasCollectedPrice: priceList.goat.hasCollectedPrice,
      },
      chicken: {
        a_grade_over_1_75: {
          code: priceList.chicken.a_grade_over_1_75.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.chicken.a_grade_over_1_75.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.chicken.a_grade_over_1_75.pricing.delivered,
            ),
          },
        },
        a_grade_1_55_1_75: {
          code: priceList.chicken.a_grade_1_55_1_75.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.chicken.a_grade_1_55_1_75.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.chicken.a_grade_1_55_1_75.pricing.delivered,
            ),
          },
        },
        a_grade_under_1_55: {
          code: priceList.chicken.a_grade_under_1_55.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.chicken.a_grade_under_1_55.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.chicken.a_grade_under_1_55.pricing.delivered,
            ),
          },
        },
        off_layers: {
          code: priceList.chicken.off_layers.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.chicken.off_layers.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.chicken.off_layers.pricing.delivered,
            ),
          },
        },
        condemned: {
          code: priceList.chicken.condemned.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.chicken.condemned?.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.chicken.condemned?.pricing.delivered,
            ),
          },
        },
        hasPrice: priceList.chicken.hasPrice,
        hasCollectedPrice: priceList.chicken.hasCollectedPrice,
      },
      pork: {
        super: {
          code: priceList.pork.super.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.pork.super.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.pork.super.pricing.delivered,
            ),
          },
        },
        manufacturing: {
          code: priceList.pork.manufacturing.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.pork.manufacturing.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.pork.manufacturing.pricing.delivered,
            ),
          },
        },
        head: {
          code: priceList.pork.head.code,
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.pork.head.pricing.collected,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.pork.head.pricing.delivered,
            ),
          },
        },
        hasPrice: priceList.pork.hasPrice,
        hasCollectedPrice: priceList.pork.hasCollectedPrice,
      },
      catering: {
        chicken: {
          order: {
            price: centsToDollarsFormInputs(
              priceList.catering.chicken.order.price,
            ),
            quantity: centsToDollarsFormInputs(
              priceList.catering.chicken.order.quantity,
            ),
          },
          frequency: priceList.catering.chicken.frequency,
        },
        hasPrice: priceList.catering.hasPrice,
        hasCollectedPrice: priceList.catering.hasCollectedPrice,
      },
      unit: priceList.unit,
    },
    resolver: zodResolver(ProducerPriceListSchema),
  })

  const [searchClient, setSearchClient] = useState("")
  const [selectedClient, setSelectedClient] = useState(priceList.client_name)
  const [open, setOpen] = useState(false)

  const showBeef = useWatch({
    name: "beef.hasPrice",
    control: form.control,
  })

  const showLamb = useWatch({
    name: "lamb.hasPrice",
    control: form.control,
  })

  const showMutton = useWatch({
    name: "mutton.hasPrice",
    control: form.control,
  })

  const showGoat = useWatch({
    name: "goat.hasPrice",
    control: form.control,
  })

  const showChicken = useWatch({
    name: "chicken.hasPrice",
    control: form.control,
  })

  const showPork = useWatch({
    name: "pork.hasPrice",
    control: form.control,
  })

  const showCatering = useWatch({
    name: "catering.hasPrice",
    control: form.control,
  })

  const [debouncedSearchQuery] = useDebounce(searchClient, 1000)

  const enabled = !!debouncedSearchQuery

  const router = useRouter()

  const { data: searchedClients } = useQuery({
    queryKey: ["dashboard-client", { search: debouncedSearchQuery }],
    queryFn: () => queryUsers({ search: debouncedSearchQuery }),
    enabled,
  })

  const clients = searchedClients?.data as ApplicationUser[]

  const { mutate, isPending } = useMutation({
    mutationFn: updateClientProductPriceList,
    onSuccess: () => {
      toast({
        description: "Created Product Price List Succesfully",
      })

      router.push(`/dashboard/prices`)
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

  function submitPriceList(payload: ProducerPriceList) {
    let createdPayload = createPriceListPayload(payload)
    mutate(createdPayload)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submitPriceList)}
        className="w-3/4 gap-4 mx-auto mb-8"
      >
        <div className="grid grid-cols-2 gap-4 mb-4">
          <FormField
            control={form.control}
            name="effectiveDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Effective Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-[240px] pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <Icons.calender className="s-4 ml-auto opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  The Day this price list came into effect ..
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select unit of measurement" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="overflow-visible max-h-44">
                      {units.map((unit) => {
                        return (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  This is the unit of measurement
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="client_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <FormMessage />
                <FormControl>
                  <div className="text-green-800 bg-green-100 border-green-400 group min-h-10 rounded-md border px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0">
                    {selectedClient}
                  </div>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <h4 className="mt-10 mb-4 text-xl font-semibold tracking-tight scroll-m-20">
          Select Pricing forms for price list
        </h4>

        <div className="grid grid-cols-4 gap-2">
          <FormField
            control={form.control}
            name="beef.hasPrice"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start p-4 space-x-3 space-y-0 border rounded-md">
                <FormLabel>Beef Form</FormLabel>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={() => {
                      return field.onChange(!field.value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lamb.hasPrice"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start p-4 space-x-3 space-y-0 border rounded-md">
                <FormLabel>Lamb Form</FormLabel>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={() => {
                      return field.onChange(!field.value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mutton.hasPrice"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start p-4 space-x-3 space-y-0 border rounded-md">
                <FormLabel>Mutton Form</FormLabel>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={() => {
                      return field.onChange(!field.value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="goat.hasPrice"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start p-4 space-x-3 space-y-0 border rounded-md">
                <FormLabel>Goat Form</FormLabel>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={() => {
                      return field.onChange(!field.value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="chicken.hasPrice"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start p-4 space-x-3 space-y-0 border rounded-md">
                <FormLabel>Chicken Form</FormLabel>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={() => {
                      return field.onChange(!field.value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pork.hasPrice"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start p-4 space-x-3 space-y-0 border rounded-md">
                <FormLabel>Pork Form</FormLabel>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={() => {
                      return field.onChange(!field.value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="catering.hasPrice"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start p-4 space-x-3 space-y-0 border rounded-md">
                <FormLabel>Catering Form</FormLabel>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={() => {
                      return field.onChange(!field.value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {showBeef ? (
          <Card className="mt-3">
            <CardHeader>
              <CardTitle>Beef Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Beef Start */}
              <h3 className="mt-3">Beef Prices Delivered</h3>
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-6">
                <FormField
                  control={form.control}
                  name="beef.super.pricing.delivered"
                  rules={{ required: "Super Pricing Required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Super</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Super Beef"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="beef.choice.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Choice</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Choice Beef"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="beef.commercial.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commercial</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Commercial Beef"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="beef.economy.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Economy</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Economy Beef"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="beef.manufacturing.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturing</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Manufacturing Beef"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="beef.condemned.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condemned</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Condemned Beef"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <h3 className="mt-2">Beef Prices Collected</h3>
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-6">
                <FormField
                  control={form.control}
                  name="beef.super.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Super</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Super Beef"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="beef.choice.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Choice</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Choice Beef"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="beef.commercial.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commercial</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Commercial Beef"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="beef.economy.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Economy</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Economy Beef"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="beef.manufacturing.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturing</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Manufacturing Beef"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="beef.condemned.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condemned</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Condemned Beef"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Beef End */}
            </CardContent>
          </Card>
        ) : null}

        {showLamb ? (
          <Card className="mt-3">
            <CardHeader>
              <CardTitle>Lamb Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Lamb Start */}
              <h3 className="mt-3">Lamb Prices Delivered</h3>
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="lamb.super_premium.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Super/Super Premium</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Super/Super Premium Lamb"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lamb.choice.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Choice</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Choice Lamb"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lamb.standard.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standard</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Standard Lamb"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lamb.inferior.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inferior</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Inferior Lamb"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <h3 className="mt-2">Lamb Prices Collected</h3>
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="lamb.super_premium.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Super/Super Premium</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Super/Super Premium Lamb"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lamb.choice.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Choice</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Choice Lamb"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lamb.standard.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standard</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Standard Lamb"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lamb.inferior.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inferior</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Inferior Lamb"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Lamb End */}
            </CardContent>
          </Card>
        ) : null}

        {showMutton ? (
          <Card className="mt-3">
            <CardHeader>
              <CardTitle>Mutton Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Mutton Start */}
              <h3 className="mt-3">Mutton Prices Delivered</h3>
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-5">
                <FormField
                  control={form.control}
                  name="mutton.super.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Super</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Super"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mutton.choice.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Choice</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Choice"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mutton.standard.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standard</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Standard"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mutton.ordinary.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ordinary</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Ordinary"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mutton.inferior.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inferior</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Inferior"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <h3 className="mt-2">Mutton Prices Collected</h3>
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-5">
                <FormField
                  control={form.control}
                  name="mutton.super.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Super</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Super"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mutton.choice.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Choice</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Choice"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mutton.standard.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standard</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Standard"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mutton.ordinary.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ordinary</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Ordinary"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mutton.inferior.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inferior</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Inferior"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Mutton End */}
            </CardContent>
          </Card>
        ) : null}

        {showGoat ? (
          <Card className="mt-3">
            <CardHeader>
              <CardTitle>Goat Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Goat Start */}
              <h3 className="mt-3">Goat Prices Delivered</h3>
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="goat.super.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Super</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Super"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="goat.choice.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Choice</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Choice"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="goat.standard.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standard</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Standard"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goat.inferior.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inferior</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Inferior"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <h3 className="mt-2">Goat Prices Collected</h3>
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="goat.super.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Super</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Super"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="goat.choice.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Choice</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Choice"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="goat.standard.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Standard</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Standard"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="goat.inferior.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Inferior</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Inferior"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Goat End */}
            </CardContent>
          </Card>
        ) : null}

        {showChicken ? (
          <Card className="mt-3">
            <CardHeader>
              <CardTitle>Chicken Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Chicken Start */}

              <h3>Chicken Prices Delivered</h3>
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-5">
                <FormField
                  control={form.control}
                  name="chicken.a_grade_under_1_55.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Below 1.55 Kgs</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Below 1.55kgs"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="chicken.a_grade_1_55_1_75.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>1.55 to 1.75 Kgs</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Between 1.55 and 1.75 Kgs"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="chicken.a_grade_over_1_75.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Over 1.75 Kgs</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price For Over 1.75Kgs"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chicken.off_layers.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Off Layers</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price OffLayers Chicken"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chicken.condemned.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condemned</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Condemned Chicken"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <h3 className="mt-3">Chicken Prices Collected</h3>
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-5">
                <FormField
                  control={form.control}
                  name="chicken.a_grade_under_1_55.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Below 1.55 Kgs</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Below 1.55kgs"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="chicken.a_grade_1_55_1_75.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>1.55 to 1.75 Kgs</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Between 1.55 and 1.75 Kgs"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="chicken.a_grade_over_1_75.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Over 1.75 Kgs</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price For Over 1.75Kgs"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chicken.off_layers.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Off Layers</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price OffLayers Chicken"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="chicken.condemned.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condemned</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Condemned Chicken"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Chicken End */}
            </CardContent>
          </Card>
        ) : null}

        {showPork ? (
          <Card className="mt-3">
            <CardHeader>
              <CardTitle>Pork Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Pork Start */}
              <h3 className="mt-3">Pork Prices Delivered</h3>
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="pork.super.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Super</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Super"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pork.manufacturing.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturing</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Manufacturing"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pork.head.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pork Head</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Pork Head"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <h3 className="mt-2">Pork Prices Collected</h3>
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="pork.super.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Super</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Super"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pork.manufacturing.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Manufacturing</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Manufacturing"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pork.head.pricing.collected"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pork Head</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Pork Head"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Pork End */}
            </CardContent>
          </Card>
        ) : null}

        {showCatering ? (
          <Card className="mt-3">
            <CardHeader>
              <CardTitle>Catering Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Catering Start */}
              <h3 className="mt-3">Catering Prices</h3>
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="catering.chicken.order.price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chicken Bird Price</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Chicken Bird"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="catering.chicken.order.quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Quantity</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Order Quantity"
                          {...field}
                          type="number"
                          min="0"
                          step="any"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Catering End */}
            </CardContent>
          </Card>
        ) : null}

        <button
          type="submit"
          className={cn(buttonVariants(), "mt-5")}
          disabled={isPending}
        >
          {isPending && <Icons.spinner className="size-4 mr-2 animate-spin" />}
          Submit
        </button>
      </form>
    </Form>
  )
}
