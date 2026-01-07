"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { format } from "date-fns"
import { useForm, useWatch } from "react-hook-form"
import { useDebounce } from "use-debounce"

import { queryFarmProduce, queryUsers, updateClientProductPriceList } from "@/lib/query"
import {
  ApplicationUser,
  FarmProduce,
  ProducerPriceList,
  ProducerPriceListSchema,
} from "@/lib/schemas"
import {centsToDollarsFormInputs, cn, createPriceListPayload} from "@/lib/utilities"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
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
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons/lucide"
import { units, pricingBasis } from "@/components/structures/repository/data"
import { PriceListProgress } from "./priceListProgress"

interface EditProductPriceFormProps
  extends React.HTMLAttributes<HTMLDivElement> {
  priceList: ProducerPriceList
}

export function EditProductPriceForm({ priceList }: EditProductPriceFormProps) {
  const form = useForm({
    defaultValues: {
      id: priceList.id,
      effectiveDate: new Date(priceList.effectiveDate),
      client_id: priceList.client_id,
      client_name: priceList.client_name,
      client_specialization: priceList.client_specialization || "livestock",
      beef: {
        farm_produce_id: priceList.beef.farm_produce_id || "",
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
        farm_produce_id: priceList.lamb.farm_produce_id || "",
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
        farm_produce_id: priceList.mutton.farm_produce_id || "",
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
        farm_produce_id: priceList.goat.farm_produce_id || "",
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
        farm_produce_id: priceList.chicken.farm_produce_id || "",
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
        farm_produce_id: priceList.pork.farm_produce_id || "",
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
        farm_produce_id: priceList.catering.farm_produce_id || "",
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
      slaughter: {
        cattle: {
          farm_produce_id: priceList.slaughter?.cattle?.farm_produce_id || "",
          pricing: {
            collected: centsToDollarsFormInputs(priceList.slaughter?.cattle?.pricing?.collected || 0),
            delivered: centsToDollarsFormInputs(priceList.slaughter?.cattle?.pricing?.delivered || 0),
          },
        },
        sheep: {
          farm_produce_id: priceList.slaughter?.sheep?.farm_produce_id || "",
          pricing: {
            collected: centsToDollarsFormInputs(priceList.slaughter?.sheep?.pricing?.collected || 0),
            delivered: centsToDollarsFormInputs(priceList.slaughter?.sheep?.pricing?.delivered || 0),
          },
        },
        pigs: {
          farm_produce_id: priceList.slaughter?.pigs?.farm_produce_id || "",
          pricing: {
            collected: centsToDollarsFormInputs(priceList.slaughter?.pigs?.pricing?.collected || 0),
            delivered: centsToDollarsFormInputs(priceList.slaughter?.pigs?.pricing?.delivered || 0),
          },
        },
        chicken: {
          farm_produce_id: priceList.slaughter?.chicken?.farm_produce_id || "",
          pricing: {
            collected: centsToDollarsFormInputs(priceList.slaughter?.chicken?.pricing?.collected || 0),
            delivered: centsToDollarsFormInputs(priceList.slaughter?.chicken?.pricing?.delivered || 0),
          },
        },
        hasPrice: priceList.slaughter?.hasPrice || false,
        hasCollectedPrice: priceList.slaughter?.hasCollectedPrice || false,
      },
      unit: priceList.unit,
      pricing_basis: priceList.pricing_basis || "LWT - Live Weight",
      notes: priceList.notes || [],
      overwrite: true,
    },
    resolver: zodResolver(ProducerPriceListSchema),
  })

  const [searchClient, setSearchClient] = useState("")
  const [selectedClient, setSelectedClient] = useState(priceList.client_name)
  const [open, setOpen] = useState(false)

  // Farm produce selection states
  const [searchFarmProduce, setSearchFarmProduce] = useState("")
  const [openFarmProduce, setOpenFarmProduce] = useState(false)

  // Initialize selectedFarmProduce based on which categories have hasPrice=true
  const initialFarmProduce = []
  if (priceList.beef?.hasPrice) initialFarmProduce.push("Beef")
  if (priceList.lamb?.hasPrice) initialFarmProduce.push("Lamb")
  if (priceList.mutton?.hasPrice) initialFarmProduce.push("Mutton")
  if (priceList.goat?.hasPrice) initialFarmProduce.push("Goat")
  if (priceList.chicken?.hasPrice) initialFarmProduce.push("Chicken")
  if (priceList.pork?.hasPrice) initialFarmProduce.push("Pork")
  if (priceList.slaughter?.hasPrice) initialFarmProduce.push("Slaughter")
  if (priceList.catering?.hasPrice) initialFarmProduce.push("Catering")

  const [selectedFarmProduce, setSelectedFarmProduce] = useState<string[]>(initialFarmProduce)

  // Derive which forms to show from selectedFarmProduce
  const showBeef = selectedFarmProduce.includes("Beef")
  const showLamb = selectedFarmProduce.includes("Lamb")
  const showMutton = selectedFarmProduce.includes("Mutton")
  const showGoat = selectedFarmProduce.includes("Goat")
  const showChicken = selectedFarmProduce.includes("Chicken")
  const showPork = selectedFarmProduce.includes("Pork")
  const showSlaughter = selectedFarmProduce.includes("Slaughter")
  const showCatering = selectedFarmProduce.includes("Catering")

  // Keep collection price checkboxes as useWatch
  const showBeefCollectionPrice = useWatch({
    name: "beef.hasCollectedPrice",
    control: form.control,
  })

  const showLambCollectionPrice = useWatch({
    name: "lamb.hasCollectedPrice",
    control: form.control,
  })

  const showMuttonCollectionPrice = useWatch({
    name: "mutton.hasCollectedPrice",
    control: form.control,
  })

  const showGoatCollectionPrice = useWatch({
    name: "goat.hasCollectedPrice",
    control: form.control,
  })

  const showChickenCollectionPrice = useWatch({
    name: "chicken.hasCollectedPrice",
    control: form.control,
  })

  const showPorkCollectionPrice = useWatch({
    name: "pork.hasCollectedPrice",
    control: form.control,
  })

  const showSlaughterCollectionPrice = useWatch({
    name: "slaughter.hasCollectedPrice",
    control: form.control,
  })

  const notes = useWatch({
    name: "notes",
    control: form.control,
  })

  const [debouncedSearchQuery] = useDebounce(searchClient, 1000)
  const [debouncedFarmProduceQuery] = useDebounce(searchFarmProduce, 1000)

  const enabled = !!debouncedSearchQuery
  const farmProduceEnabled = !!debouncedFarmProduceQuery

  const router = useRouter()

  const { data: searchedClients } = useQuery({
    queryKey: ["dashboard-client", { search: debouncedSearchQuery }],
    queryFn: () => queryUsers({ search: debouncedSearchQuery }),
    enabled,
  })

  const clients = searchedClients?.data as ApplicationUser[]

  // Map certain search terms to their specific farm produce names
  const getMappedSearchTerm = (searchTerm: string) => {
    const mapping: Record<string, string> = {
      "chicken": "Chickens (Broilers)",
    }
    const lowerSearch = searchTerm.toLowerCase()
    return mapping[lowerSearch] || searchTerm
  }

  const mappedFarmProduceQuery = getMappedSearchTerm(debouncedFarmProduceQuery)

  const { data: farmProduceData } = useQuery({
    queryKey: ["farm-produce", { search: mappedFarmProduceQuery }],
    queryFn: () => queryFarmProduce({ search: mappedFarmProduceQuery }),
    enabled: farmProduceEnabled,
  })

  const farmProduceItems = farmProduceData?.data?.data as FarmProduce[]

  const { mutate, isPending } = useMutation({
    mutationFn: updateClientProductPriceList,
    onSuccess: () => {
      toast({
        description: "Updated Price Listing Successfully",
      })

      router.push(`/dashboard/prices/${priceList.id}`)
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        // Check for HTTP 409 Conflict (duplicate price list)
        if (error.response?.status === 409) {
          toast({
            title: "Duplicate Price List",
            description: error.response?.data?.message || "A price list already exists for this client and effective date. Please choose a different date.",
            variant: "destructive",
          })
          return
        }

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
        className="w-[92%] gap-4 mx-auto mb-8"
      >
        <div className="mb-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/prices")}
            className="w-full"
          >
            <Icons.chevronLeft className="size-4 mr-2" />
            Back
          </Button>
        </div>

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
                        <Icons.calender className="size-4 ml-auto opacity-50" />
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
                <FormControl>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild className="w-80">
                      <div className="group min-h-10 rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0 cursor-pointer" tabIndex={0} role="button">
                        <div className="flex flex-wrap gap-1">
                          {selectedClient.length > 1 ? (
                            <Badge
                              variant="outline"
                              className="flex justify-between text-green-800 bg-green-100 border-green-400"
                            >
                              {selectedClient}
                            </Badge>
                          ) : (
                            "Select Client For Pricing List ..."
                          )}
                        </div>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-[320px] p-0">
                      <Command shouldFilter={false}>
                        <CommandInput
                          value={searchClient}
                          onValueChange={setSearchClient}
                          placeholder="Search..."
                        />

                        {clients?.length > 0 ? (
                          <CommandList className="mb-8 max-h-[150px]">
                            {clients.map((client) => {
                              return (
                                <CommandItem
                                  key={client.id}
                                  value={client.id}
                                  onSelect={(value) => {
                                    field.onChange(value)
                                    setSelectedClient(client.name)
                                    setOpen(false)
                                    setSearchClient("")
                                  }}
                                >
                                  <span>{client.name}</span>
                                </CommandItem>
                              )
                            })}
                          </CommandList>
                        ) : null}
                      </Command>
                    </PopoverContent>
                  </Popover>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="pricing_basis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pricing Basis</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pricing basis" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="overflow-visible max-h-44">
                      {pricingBasis.map((basis) => {
                        return (
                          <SelectItem key={basis} value={basis}>
                            {basis}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormDescription>
                  Select the pricing basis for this price list
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormItem className="mt-4">
          <FormLabel>Farm Produce (Multi-Select)</FormLabel>
          <FormMessage />
          <Popover open={openFarmProduce} onOpenChange={setOpenFarmProduce}>
            <PopoverTrigger asChild className="w-80">
              <div className="group min-h-10 rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0 cursor-pointer" tabIndex={0} role="button">
                <div className="flex flex-wrap gap-1">
                  {selectedFarmProduce.length > 0 ? (
                    selectedFarmProduce.map((produce, index) => (
                      <Badge
                        key={`${produce}-${index}`}
                        variant="outline"
                        className="flex justify-between text-blue-800 bg-blue-100 border-blue-400"
                      >
                        {produce}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedFarmProduce(prev =>
                              prev.filter(p => p !== produce)
                            )
                            // Update hasPrice when removing
                            const fieldName = produce.toLowerCase()
                            if (["beef", "lamb", "mutton", "goat", "chicken", "pork", "slaughter", "catering"].includes(fieldName)) {
                              form.setValue(`${fieldName}.hasPrice` as any, false)
                            }
                          }}
                          className="ml-1 hover:text-blue-600"
                        >
                          ×
                        </button>
                      </Badge>
                    ))
                  ) : (
                    "Select Farm Produce Items..."
                  )}
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] p-0">
              <Command shouldFilter={false}>
                <CommandInput
                  value={searchFarmProduce}
                  onValueChange={setSearchFarmProduce}
                  placeholder="Search farm produce..."
                />

                {farmProduceItems?.length > 0 ? (
                  <CommandList className="mb-8 max-h-[150px]">
                    {farmProduceItems
                      .filter((item, index, self) =>
                        index === self.findIndex((t) => t.id === item.id)
                      )
                      .map((item) => {
                      const isSelected = selectedFarmProduce.includes(item.name)
                      return (
                        <CommandItem
                          key={item.id}
                          value={item.id}
                          onSelect={() => {
                            setSelectedFarmProduce((prev) => {
                              const alreadySelected = prev.includes(item.name)
                              const newSelection = alreadySelected
                                ? prev.filter((p) => p !== item.name)
                                : [...prev, item.name]

                              // Update hasPrice based on selection
                              const fieldName = item.name.toLowerCase()
                              if (["beef", "lamb", "mutton", "goat", "chicken", "pork", "slaughter", "catering"].includes(fieldName)) {
                                form.setValue(`${fieldName}.hasPrice` as any, !alreadySelected)
                              }

                              return newSelection
                            })
                          }}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                setSelectedFarmProduce((prev) => {
                                  const newSelection = checked
                                    ? (prev.includes(item.name) ? prev : [...prev, item.name])
                                    : prev.filter((p) => p !== item.name)

                                  // Update hasPrice based on selection
                                  const fieldName = item.name.toLowerCase()
                                  if (["beef", "lamb", "mutton", "goat", "chicken", "pork", "slaughter", "catering"].includes(fieldName)) {
                                    form.setValue(`${fieldName}.hasPrice` as any, !!checked)
                                  }

                                  return newSelection
                                })
                              }}
                            />
                            <span>{item.name}</span>
                          </div>
                        </CommandItem>
                      )
                    })}
                  </CommandList>
                ) : null}
              </Command>
            </PopoverContent>
          </Popover>
        </FormItem>

        {/* Progress Indicator */}
        <div className="mt-4">
          <PriceListProgress values={form.watch()} />
        </div>

        {showBeef ? (
          <Card className="mt-3">
            <CardHeader>
              <CardTitle>Beef Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Add Collection Price Checkbox */}
              <FormField
                control={form.control}
                name="beef.hasCollectedPrice"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Add Collection Prices</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {showBeefCollectionPrice ? (
                <>
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
                </>
              ) : null}
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
              <FormField
                control={form.control}
                name="lamb.hasCollectedPrice"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Add Collection Prices</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {showLambCollectionPrice ? (
                <>
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
                </>
              ) : null}
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
              <FormField
                control={form.control}
                name="mutton.hasCollectedPrice"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Add Collection Prices</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {showMuttonCollectionPrice ? (
                <>
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
                </>
              ) : null}
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
              <FormField
                control={form.control}
                name="goat.hasCollectedPrice"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Add Collection Prices</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {showGoatCollectionPrice ? (
                <>
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
                </>
              ) : null}
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
              <FormField
                control={form.control}
                name="chicken.hasCollectedPrice"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Add Collection Prices</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {showChickenCollectionPrice ? (
                <>
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
                </>
              ) : null}
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
              <FormField
                control={form.control}
                name="pork.hasCollectedPrice"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Add Collection Prices</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {showPorkCollectionPrice ? (
                <>
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
                </>
              ) : null}
              {/* Pork End */}
            </CardContent>
          </Card>
        ) : null}

        {showSlaughter ? (
          <Card className="mt-3">
            <CardHeader>
              <CardTitle>Slaughter Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="slaughter.hasCollectedPrice"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mb-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Add Collection Prices</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slaughter Start */}
              <h3 className="mt-3">Slaughter Prices Delivered</h3>
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="slaughter.cattle.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cattle</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Cattle Slaughter"
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
                  name="slaughter.sheep.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sheep</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Sheep Slaughter"
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
                  name="slaughter.pigs.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pigs</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Pigs Slaughter"
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
                  name="slaughter.chicken.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chicken per kg LWT</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Chicken Slaughter per kg"
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

              {showSlaughterCollectionPrice ? (
                <>
                  <h3 className="mt-2">Slaughter Prices Collected</h3>
                  <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                    <FormField
                      control={form.control}
                      name="slaughter.cattle.pricing.collected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cattle</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Price Cattle Slaughter"
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
                      name="slaughter.sheep.pricing.collected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sheep</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Price Sheep Slaughter"
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
                      name="slaughter.pigs.pricing.collected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pigs</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Price Pigs Slaughter"
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
                      name="slaughter.chicken.pricing.collected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chicken per kg LWT</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Price Chicken Slaughter per kg"
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
                </>
              ) : null}
              {/* Slaughter End */}
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

        {/* Notes Section */}
        {notes && notes.length > 0 && (
          <Card className="mt-3">
            <CardHeader>
              <CardTitle>Important Notes & Terms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {notes.map((note, index) => (
                  <Alert key={index}>
                    <Icons.info className="size-4" />
                    <AlertDescription className="text-sm">
                      {note}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
