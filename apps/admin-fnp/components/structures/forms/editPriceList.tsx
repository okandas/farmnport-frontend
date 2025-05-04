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
import {centsToDollarsFormInputs, cn, submitPriceList, useFormCreatePriceListForm} from "@/lib/utilities"

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
  const form = useFormCreatePriceListForm(priceList)

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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          submitPriceList(values, mutate),
        )}
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
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-6">
                <FormField
                  control={form.control}
                  name="beef.super"
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
                  name="beef.choice"
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
                  name="beef.commercial"
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
                  name="beef.economy"
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
                  name="beef.manufacturing"
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
                  name="beef.condemned"
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
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="lamb.superPremium"
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
                  name="lamb.choice"
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
                  name="lamb.standard"
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
                  name="lamb.inferior"
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
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-5">
                <FormField
                  control={form.control}
                  name="mutton.super"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Super</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Super "
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
                  name="mutton.choice"
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
                  name="mutton.standard"
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
                  name="mutton.ordinary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Oridnary</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Oridnary"
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
                  name="mutton.inferior"
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
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="goat.super"
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
                  name="goat.choice"
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
                  name="goat.standard"
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
                  name="goat.inferior"
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
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="chicken.below"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Below</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Below"
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
                  name="chicken.midRange"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Midrange</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Midrange"
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
                  name="chicken.above"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Above</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Price Above"
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
                  name="chicken.condemned"
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
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="pork.super"
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
                  name="pork.manufacturing"
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
                  name="pork.head"
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
              <div className="grid grid-cols-1 gap-5 mt-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                <FormField
                  control={form.control}
                  name="catering.chicken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chicken Bird</FormLabel>
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
