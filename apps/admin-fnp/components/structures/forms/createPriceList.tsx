"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { format } from "date-fns"
import { useForm, useWatch } from "react-hook-form"
import { useDebounce } from "use-debounce"

import { createClientProductPriceList, queryUsers, queryFarmProduce } from "@/lib/query"
import {
  ApplicationUser,
  ProducerPriceList,
  ProducerPriceListSchema,
  FarmProduce,
} from "@/lib/schemas"
import {
  centsToDollarsFormInputs,
  cn,
  createPriceListPayload,
  dollarsToCents,
} from "@/lib/utilities"
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
import { units } from "@/components/structures/repository/data"
import { zodResolver } from "@hookform/resolvers/zod"
import { PriceListProgress } from "./priceListProgress"
import { ValidationSummary } from "./validationSummary"
import { ExcelImport } from "./excelImport"

interface CreateProductPriceFormProps
  extends React.HTMLAttributes<HTMLDivElement> {
  priceList: ProducerPriceList
}

export function CreateProductPriceForm({
  priceList,
}: CreateProductPriceFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm({
    defaultValues: {
      id: priceList.id,
      effectiveDate: new Date(),
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
      slaughter: {
        cattle: {
          farm_produce_id: priceList.slaughter?.cattle?.farm_produce_id || "",
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.slaughter?.cattle?.pricing?.collected || 0,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.slaughter?.cattle?.pricing?.delivered || 0,
            ),
          },
        },
        sheep: {
          farm_produce_id: priceList.slaughter?.sheep?.farm_produce_id || "",
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.slaughter?.sheep?.pricing?.collected || 0,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.slaughter?.sheep?.pricing?.delivered || 0,
            ),
          },
        },
        pigs: {
          farm_produce_id: priceList.slaughter?.pigs?.farm_produce_id || "",
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.slaughter?.pigs?.pricing?.collected || 0,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.slaughter?.pigs?.pricing?.delivered || 0,
            ),
          },
        },
        chicken: {
          farm_produce_id: priceList.slaughter?.chicken?.farm_produce_id || "",
          pricing: {
            collected: centsToDollarsFormInputs(
              priceList.slaughter?.chicken?.pricing?.collected || 0,
            ),
            delivered: centsToDollarsFormInputs(
              priceList.slaughter?.chicken?.pricing?.delivered || 0,
            ),
          },
        },
        hasPrice: priceList.slaughter?.hasPrice || false,
        hasCollectedPrice: priceList.slaughter?.hasCollectedPrice || false,
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
      unit: priceList.unit || "kg",
      notes: priceList.notes || [],
      overwrite: false,
    },
    resolver: zodResolver(ProducerPriceListSchema),
  })

  const [searchClient, setSearchClient] = useState("")
  const [selectedClient, setSelectedClient] = useState(priceList.client_name)
  const [open, setOpen] = useState(false)

  const [searchFarmProduce, setSearchFarmProduce] = useState("")
  const [selectedFarmProduce, setSelectedFarmProduce] = useState<string[]>([])
  const [openFarmProduce, setOpenFarmProduce] = useState(false)

  const showBeef = useWatch({
    name: "beef.hasPrice",
    control: form.control,
  })

  const showBeefCollectionPrice = useWatch({
    name: "beef.hasCollectedPrice",
    control: form.control,
  })

  const showChicken = useWatch({
    name: "chicken.hasPrice",
    control: form.control,
  })

  const showChickenCollectionPrice = useWatch({
    name: "chicken.hasCollectedPrice",
    control: form.control,
  })

  const showLamb = useWatch({
    name: "lamb.hasPrice",
    control: form.control,
  })

  const showLambCollectionPrice = useWatch({
    name: "lamb.hasCollectedPrice",
    control: form.control,
  })

  const showMutton = useWatch({
    name: "mutton.hasPrice",
    control: form.control,
  })

  const showMuttonCollectionPrice = useWatch({
    name: "mutton.hasCollectedPrice",
    control: form.control,
  })

  const showGoat = useWatch({
    name: "goat.hasPrice",
    control: form.control,
  })

  const showGoatCollectionPrice = useWatch({
    name: "goat.hasCollectedPrice",
    control: form.control,
  })

  const showPork = useWatch({
    name: "pork.hasPrice",
    control: form.control,
  })

  const showPorkCollectionPrice = useWatch({
    name: "pork.hasCollectedPrice",
    control: form.control,
  })

  const showSlaughter = useWatch({
    name: "slaughter.hasPrice",
    control: form.control,
  })

  const showSlaughterCollectionPrice = useWatch({
    name: "slaughter.hasCollectedPrice",
    control: form.control,
  })

  const showCatering = useWatch({
    name: "catering.hasPrice",
    control: form.control,
  })

  const notes = useWatch({
    name: "notes",
    control: form.control,
  })

  const [debouncedSearchQuery] = useDebounce(searchClient, 1000)

  const enabled = !!debouncedSearchQuery

  const router = useRouter()

  const { data, isError, refetch } = useQuery({
    queryKey: ["dashboard-client", { search: debouncedSearchQuery }],
    queryFn: () =>
      queryUsers({
        search: debouncedSearchQuery,
      }),
    enabled,
  })

  const clients = data?.data?.data as ApplicationUser[]

  // Farm Produce query - same behavior as client query
  const [debouncedFarmProduceQuery] = useDebounce(searchFarmProduce, 1000)
  const enabledFarmProduce = !!debouncedFarmProduceQuery

  // Map certain search terms to their specific farm produce names
  const getMappedSearchTerm = (searchTerm: string) => {
    const mapping: Record<string, string> = {
      "chicken": "Chickens (Broilers)",
    }
    const lowerSearch = searchTerm.toLowerCase()
    return mapping[lowerSearch] || searchTerm
  }

  const mappedFarmProduceQuery = getMappedSearchTerm(debouncedFarmProduceQuery)

  const {
    data: farmProduceData,
    isError: isFarmProduceError,
    refetch: refetchFarmProduce
  } = useQuery({
    queryKey: ["dashboard-farmproduce", { search: mappedFarmProduceQuery }],
    queryFn: () =>
      queryFarmProduce({
        search: mappedFarmProduceQuery,
      }),
    enabled: enabledFarmProduce,
  })

  const farmProduceItems = farmProduceData?.data?.data as FarmProduce[]

  // Farm produce error handling - same as clients
  if (isFarmProduceError) {
    if (isAxiosError(farmProduceData)) {
      setOpenFarmProduce(false)

      switch (farmProduceData.code) {
        case "ERR_NETWORK":
          toast({
            description: "There seems to be a network error.",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          })
          break

        default:
          toast({
            title: "Uh oh! Failed to fetch farm produce.",
            description: "There was a problem with your request.",
            action: (
              <ToastAction altText="Try again" onClick={() => refetchFarmProduce()}>
                Try again
              </ToastAction>
            ),
          })
          break
      }
    }
  }

  if (isError) {
    if (isAxiosError(data)) {
      setOpen(false)

      switch (data.code) {
        case "ERR_NETWORK":
          toast({
            description: "There seems to be a network error.",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          })
          break

        default:
          toast({
            title: "Uh oh! Failed to fetch clients.",
            description: "There was a problem with your request.",
            action: (
              <ToastAction altText="Try again" onClick={() => refetch()}>
                Try again
              </ToastAction>
            ),
          })
          break
      }
    }
  }

  function submitPriceList(payload: ProducerPriceList) {
    setIsSubmitted(true)
    let createdPayload = createPriceListPayload(payload)
    console.log("🚀 FORM SUBMITTED - Full Payload:")
    console.log(JSON.stringify(payload, null, 2))
    console.log("🚀 Created Payload:")
    console.log(JSON.stringify(createdPayload, null, 2))
    mutate(createdPayload)
  }

  const { mutate, isPending } = useMutation({
    mutationFn: createClientProductPriceList,
    onSuccess: () => {
      toast({
        description: "Created Product Price List Successfully",
      })

      router.push(`/dashboard/prices`)
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        // Check for HTTP 409 Conflict (duplicate price list)
        if (error.response?.status === 409) {
          toast({
            title: "Duplicate Price List",
            description: error.response?.data?.message || "A price list already exists for this client and effective date. Please enable the 'Overwrite' option to replace it, or choose a different date.",
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submitPriceList)}
        className="w-[92%] gap-4 mx-auto mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Create New Producer Price List
          </h1>
          <ExcelImport
            setValue={form.setValue}
            setSelectedFarmProduce={setSelectedFarmProduce}
            setSelectedClient={setSelectedClient}
          />
        </div>

        {/* Validation Summary */}
        <ValidationSummary errors={form.formState.errors} isSubmitted={isSubmitted} />

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
            name="overwrite"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Overwrite existing price list
                  </FormLabel>
                  <FormDescription>
                    If a price list already exists for this client and effective date, it will be replaced with this new one.
                  </FormDescription>
                </div>
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

          <FormItem>
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
                                if (alreadySelected) {
                                  return prev.filter((p) => p !== item.name)
                                } else {
                                  return [...prev, item.name]
                                }
                              })
                            }}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => {
                                  setSelectedFarmProduce((prev) => {
                                    if (checked) {
                                      // Add only if not already present
                                      return prev.includes(item.name) ? prev : [...prev, item.name]
                                    } else {
                                      return prev.filter((p) => p !== item.name)
                                    }
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
        </div>

        {/* Progress Indicator */}
        <PriceListProgress values={form.watch()} />

        {/* Farm Produce Pricing Forms */}
        {selectedFarmProduce.includes("Beef") ? (
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

        {/* Lamb Pricing Form */}
        {selectedFarmProduce.includes("Lamb") ? (
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

              <h3 className="mt-3">Lamb Prices Delivered</h3>
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="lamb.super_premium.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Super Premium</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Super Premium Lamb"
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
                          <FormLabel>Super Premium</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Price Super Premium Lamb"
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
            </CardContent>
          </Card>
        ) : null}

        {/* Mutton Pricing Form */}
        {selectedFarmProduce.includes("Mutton") ? (
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
                          placeholder="Price Super Mutton"
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
                          placeholder="Price Choice Mutton"
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
                          placeholder="Price Standard Mutton"
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
                          placeholder="Price Ordinary Mutton"
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
                          placeholder="Price Inferior Mutton"
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
                              placeholder="Price Super Mutton"
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
                              placeholder="Price Choice Mutton"
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
                              placeholder="Price Standard Mutton"
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
                              placeholder="Price Ordinary Mutton"
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
                              placeholder="Price Inferior Mutton"
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
            </CardContent>
          </Card>
        ) : null}

        {/* Goat Pricing Form */}
        {selectedFarmProduce.includes("Goat") ? (
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
                          placeholder="Price Super Goat"
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
                          placeholder="Price Choice Goat"
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
                          placeholder="Price Standard Goat"
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
                          placeholder="Price Inferior Goat"
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
                              placeholder="Price Super Goat"
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
                              placeholder="Price Choice Goat"
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
                              placeholder="Price Standard Goat"
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
                              placeholder="Price Inferior Goat"
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
            </CardContent>
          </Card>
        ) : null}

        {/* Chicken Pricing Form */}
        {selectedFarmProduce.includes("Chicken") ? (
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

              <h3 className="mt-3">Chicken Prices Delivered</h3>
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-5">
                <FormField
                  control={form.control}
                  name="chicken.a_grade_over_1_75.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>A Grade Over 1.75kg</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price A Grade Over 1.75kg"
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
                      <FormLabel>A Grade 1.55-1.75kg</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price A Grade 1.55-1.75kg"
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
                  name="chicken.a_grade_under_1_55.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>A Grade Under 1.55kg</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price A Grade Under 1.55kg"
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
                          placeholder="Price Off Layers"
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
                  <h3 className="mt-2">Chicken Prices Collected</h3>
                  <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-5">
                    <FormField
                      control={form.control}
                      name="chicken.a_grade_over_1_75.pricing.collected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>A Grade Over 1.75kg</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Price A Grade Over 1.75kg"
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
                          <FormLabel>A Grade 1.55-1.75kg</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Price A Grade 1.55-1.75kg"
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
                      name="chicken.a_grade_under_1_55.pricing.collected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>A Grade Under 1.55kg</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Price A Grade Under 1.55kg"
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
                              placeholder="Price Off Layers"
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
            </CardContent>
          </Card>
        ) : null}

        {/* Pork Pricing Form */}
        {selectedFarmProduce.includes("Pork") ? (
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

              <h3 className="mt-3">Pork Prices Delivered</h3>
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                <FormField
                  control={form.control}
                  name="pork.super.pricing.delivered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Super</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Super Pork"
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
                          placeholder="Price Manufacturing Pork"
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
                      <FormLabel>Head</FormLabel>
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
                  <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="pork.super.pricing.collected"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Super</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Price Super Pork"
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
                              placeholder="Price Manufacturing Pork"
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
                          <FormLabel>Head</FormLabel>
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
            </CardContent>
          </Card>
        ) : null}

        {/* Slaughter Pricing Form */}
        {selectedFarmProduce.includes("Slaughter") ? (
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
            </CardContent>
          </Card>
        ) : null}

        {/* Catering Pricing Form */}
        {selectedFarmProduce.includes("Catering") ? (
          <Card className="mt-3">
            <CardHeader>
              <CardTitle>Catering Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="mt-3">Catering Chicken Order</h3>
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                <FormField
                  control={form.control}
                  name="catering.chicken.order.price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Order Price"
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
                      <FormLabel>Quantity</FormLabel>
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
                <FormField
                  control={form.control}
                  name="catering.chicken.frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Order Frequency"
                          {...field}
                          type="text"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
