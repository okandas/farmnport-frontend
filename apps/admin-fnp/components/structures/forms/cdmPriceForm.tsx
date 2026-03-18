"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { format } from "date-fns"
import { useForm, useFieldArray } from "react-hook-form"
import { useDebounce } from "use-debounce"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Plus, Trash2 } from "lucide-react"

import { addCdmPrice, updateCdmPrice, queryUsers } from "@/lib/query"
import {
  ApplicationUser,
  CdmPrice,
  CdmPriceSchema,
} from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { handleApiError, handleFormErrors } from "@/lib/error-handler"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Command,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Form,
  FormControl,
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
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons/lucide"
import { CdmExcelImport } from "@/components/structures/forms/cdmExcelImport"

const WEIGHT_RANGES = ["300+", "260-299", "180-259", "160-180"]
const TEETH_CATEGORIES = ["MT", "2T", "4T", "6T"]

const defaultLiveweightEntries = WEIGHT_RANGES.flatMap((range) =>
  TEETH_CATEGORIES.map((teeth) => ({
    weight_range: range,
    teeth,
    delivered_usd: 0,
    delivered_zig: 0,
    grade_note: "",
  }))
)

const defaultCarcassGrade = {
  collected_usd: 0,
  delivered_usd: 0,
  collected_zig: 0,
  delivered_zig: 0,
}

interface CdmPriceFormProps {
  price?: CdmPrice
  mode: "create" | "edit"
}

export function CdmPriceForm({ price, mode }: CdmPriceFormProps) {
  const router = useRouter()
  const [searchClient, setSearchClient] = useState(price?.client_name || "")
  const [selectedClient, setSelectedClient] = useState(price?.client_name || "")
  const [openClient, setOpenClient] = useState(false)
  const [openCalendar, setOpenCalendar] = useState(false)
  const [noteInput, setNoteInput] = useState("")

  const form = useForm<CdmPrice>({
    defaultValues: price
      ? {
          ...price,
          effectiveDate: new Date(price.effectiveDate),
        }
      : {
          id: "",
          client_id: "",
          client_name: "",
          effectiveDate: new Date(),
          exchange_rate: 0,
          carcass_grades: {
            commercial: { ...defaultCarcassGrade },
            economy: { ...defaultCarcassGrade },
            manufacturing: { ...defaultCarcassGrade },
          },
          liveweight: defaultLiveweightEntries,
          notes: [],
        },
    resolver: zodResolver(CdmPriceSchema),
  })

  const { fields: liveweightFields } = useFieldArray({
    control: form.control,
    name: "liveweight" as any,
  })

  const notes = form.watch("notes")

  // Client search
  const [debouncedSearchQuery] = useDebounce(searchClient, 1000)
  const enabled = !!debouncedSearchQuery

  const { data } = useQuery({
    queryKey: ["dashboard-client", { search: debouncedSearchQuery }],
    queryFn: () => queryUsers({ search: debouncedSearchQuery }),
    enabled,
  })

  const clients = data?.data?.data as ApplicationUser[]

  // Mutations
  const { mutate: createMutate, isPending: isCreating } = useMutation({
    mutationFn: addCdmPrice,
    onSuccess: () => {
      toast({ description: "CDM price created successfully" })
      router.push("/dashboard/cdm-prices")
    },
    onError: (error) => {
      handleApiError(error, { context: "CDM price creation" })
    },
  })

  const { mutate: updateMutate, isPending: isUpdating } = useMutation({
    mutationFn: updateCdmPrice,
    onSuccess: () => {
      toast({ description: "CDM price updated successfully" })
      router.push("/dashboard/cdm-prices")
    },
    onError: (error) => {
      handleApiError(error, { context: "CDM price update" })
    },
  })

  const isPending = isCreating || isUpdating

  function onSubmit(data: CdmPrice) {
    // Set client_name from selected
    data.client_name = selectedClient
    if (mode === "create") {
      createMutate(data)
    } else {
      updateMutate(data)
    }
  }

  function addNote() {
    if (noteInput.trim()) {
      const current = form.getValues("notes") || []
      form.setValue("notes", [...current, noteInput.trim()])
      setNoteInput("")
    }
  }

  function removeNote(index: number) {
    const current = form.getValues("notes") || []
    form.setValue(
      "notes",
      current.filter((_, i) => i !== index)
    )
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {mode === "create" ? "Add CDM Price" : "Edit CDM Price"}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {mode === "create"
              ? "Create a new Cold Dress Mass price list"
              : "Update CDM price list"}
          </p>
        </div>
        <CdmExcelImport
          setValue={form.setValue}
          setSelectedClient={setSelectedClient}
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, (errors) => handleFormErrors(errors))} className="space-y-8">
          {/* Client & Date Section */}
          <Card>
            <CardHeader>
              <CardTitle>Price Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                {/* Client selector */}
                <FormField
                  control={form.control}
                  name="client_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <FormControl>
                        <Popover open={openClient} onOpenChange={setOpenClient}>
                          <PopoverTrigger asChild className="w-full">
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
                                  "Select Client..."
                                )}
                              </div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-[320px] p-0">
                            <Command shouldFilter={false}>
                              <CommandInput
                                value={searchClient}
                                onValueChange={setSearchClient}
                                placeholder="Search clients..."
                              />
                              {clients?.length > 0 ? (
                                <CommandList className="mb-8 max-h-[150px]">
                                  {clients.map((client) => (
                                    <CommandItem
                                      key={client.id}
                                      value={client.id}
                                      onSelect={(value) => {
                                        field.onChange(value)
                                        setSelectedClient(client.name)
                                        form.setValue("client_name", client.name)
                                        form.setValue("verified", client.verified)
                                        setOpenClient(false)
                                        setSearchClient("")
                                      }}
                                    >
                                      <span>{client.name}</span>
                                    </CommandItem>
                                  ))}
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

                {/* Effective Date */}
                <FormField
                  control={form.control}
                  name="effectiveDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective Date</FormLabel>
                      <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? format(field.value, "dd MMMM yyyy") : "Pick a date"}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => {
                              field.onChange(date)
                              setOpenCalendar(false)
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Exchange Rate */}
                <FormField
                  control={form.control}
                  name="exchange_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exchange Rate (USD to ZIG)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="e.g. 27.50"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Carcass Grades Section */}
          <Card>
            <CardHeader>
              <CardTitle>Carcass Grades (per kg)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left font-medium">Grade</th>
                      <th className="py-2 text-left font-medium">Collected USD</th>
                      <th className="py-2 text-left font-medium">Delivered USD</th>
                      <th className="py-2 text-left font-medium">Collected ZIG</th>
                      <th className="py-2 text-left font-medium">Delivered ZIG</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(["commercial", "economy", "manufacturing"] as const).map((grade) => (
                      <tr key={grade} className="border-b">
                        <td className="py-3 font-medium capitalize">{grade} ({grade === "commercial" ? "C" : grade === "economy" ? "X" : "J"})</td>
                        {(["collected_usd", "delivered_usd", "collected_zig", "delivered_zig"] as const).map((priceField) => (
                          <td key={priceField} className="py-3 pr-2">
                            <FormField
                              control={form.control}
                              name={`carcass_grades.${grade}.${priceField}`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      className="w-28"
                                      {...field}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Liveweight Section */}
          <Card>
            <CardHeader>
              <CardTitle>Liveweight Prices (per kg delivered)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 text-left font-medium">Weight Range (kg)</th>
                      <th className="py-2 text-left font-medium">Teeth</th>
                      <th className="py-2 text-left font-medium">Delivered USD</th>
                      <th className="py-2 text-left font-medium">Delivered ZIG</th>
                      <th className="py-2 text-left font-medium">Grade Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveweightFields.map((field, index) => (
                      <tr key={field.id} className="border-b">
                        <td className="py-3">
                          <FormField
                            control={form.control}
                            name={`liveweight.${index}.weight_range`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="w-28">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {WEIGHT_RANGES.map((range) => (
                                        <SelectItem key={range} value={range}>
                                          {range}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </td>
                        <td className="py-3">
                          <FormField
                            control={form.control}
                            name={`liveweight.${index}.teeth`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger className="w-20">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {TEETH_CATEGORIES.map((teeth) => (
                                        <SelectItem key={teeth} value={teeth}>
                                          {teeth}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </td>
                        <td className="py-3 pr-2">
                          <FormField
                            control={form.control}
                            name={`liveweight.${index}.delivered_usd`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input type="number" step="0.01" className="w-28" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </td>
                        <td className="py-3 pr-2">
                          <FormField
                            control={form.control}
                            name={`liveweight.${index}.delivered_zig`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input type="number" step="0.01" className="w-28" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </td>
                        <td className="py-3">
                          <FormField
                            control={form.control}
                            name={`liveweight.${index}.grade_note`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="e.g. Kill / Low Grade" className="w-40" {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Add a note..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addNote()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addNote}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {notes && notes.length > 0 && (
                <ul className="space-y-2">
                  {notes.map((note, index) => (
                    <li key={index} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <span>{note}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNote(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center justify-end gap-x-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push("/dashboard/cdm-prices")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create" : "Update"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
