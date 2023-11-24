"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { useForm, useWatch } from "react-hook-form"

import { createClient } from "@/lib/query"
import { EditApplicationUser, EditApplicationUserSchema } from "@/lib/schemas"
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
  mainActivity,
  provinces,
  scales,
  specializations,
} from "@/components/structures/data/data"

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
      main_activity: client?.main_activity,
      specialization: client?.specialization,
      specializations: client?.specializations,
      type: client?.type,
      scale: client?.scale,
      branches: client?.branches,
      short_description: client?.short_description,
    },
    resolver: zodResolver(EditApplicationUserSchema),
  })

  const selectedSpecializations = useWatch({
    name: "specializations",
    control: form.control,
  })

  const selectedMainActivity = useWatch({
    name: "main_activity",
    control: form.control,
  })

  const changingSpecialization = form.watch("specialization")

  const [open, setOpen] = useState(false)

  const router = useRouter()

  const { mutate, isPending } = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      toast({
        description: "Created User Succesfully",
      })

      router.push(`/dashboard/users`)
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
        className="w-3/4 gap-4 mx-auto mb-8"
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
            name="specialization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specialization</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={client?.specialization}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a specialization" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="overflow-visible max-h-44">
                    {specializations.map((specialization) => {
                      return (
                        <SelectItem key={specialization} value={specialization}>
                          {specialization}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <FormDescription>
                  {client?.type === "buyer"
                    ? "This is the main industry you source from."
                    : "This is the main area of production on you farm"}
                </FormDescription>
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
            name="main_activity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Main Activity</FormLabel>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={
                      client?.main_activity ??
                      "Please Pick A Specialization First"
                    }
                    disabled={changingSpecialization?.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="What do you do ?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="overflow-visible max-h-44">
                      {mainActivity[changingSpecialization]?.map((activity) => {
                        return (
                          <SelectItem key={activity} value={activity}>
                            {activity}
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
            name="specializations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specializations</FormLabel>
                <FormControl>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <div className="group min-h-[2.5rem] rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0">
                        <div className="flex flex-wrap gap-1">
                          {selectedSpecializations.length > 1
                            ? selectedSpecializations?.map((selected) => {
                              if (selected.length !== 0) {
                                return (
                                  <Badge
                                    key={selected}
                                    variant="outline"
                                    className="flex justify-between text-green-800 bg-green-100 border-green-400"
                                  >
                                    {selected}
                                  </Badge>
                                )
                              }
                            })
                            : "Select Specialization ..."}
                        </div>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-[320px] p-0">
                      <Command className="border rounded-lg shadow-md max-h-52">
                        <CommandInput placeholder="Search..." />
                        <CommandList>
                          <CommandEmpty className="py-3 text-center">
                            No results found.
                          </CommandEmpty>
                          {specializations.map((specialization) => {
                            return (
                              <CommandGroup
                                key={specialization}
                                heading={specialization}
                              >
                                {mainActivity[specialization].map(
                                  (activity) => {
                                    if (selectedMainActivity !== activity) {
                                      return (
                                        <CommandItem
                                          key={activity}
                                          onSelect={(value) => {
                                            if (
                                              !selectedSpecializations?.includes(
                                                value,
                                              )
                                            ) {
                                              const NewSpecialization = [
                                                ...selectedSpecializations,
                                                value,
                                              ]

                                              form.setValue(
                                                "specializations",
                                                NewSpecialization,
                                              )
                                            } else {
                                              const removeAtIndex =
                                                selectedSpecializations?.indexOf(
                                                  value,
                                                )

                                              selectedSpecializations?.splice(
                                                removeAtIndex,
                                                1,
                                              )

                                              form.setValue(
                                                "specializations",
                                                selectedSpecializations,
                                              )
                                            }
                                          }}
                                        >
                                          {selectedSpecializations?.includes(
                                            activity,
                                          ) ? (
                                            <Icons.check className="w-4 h-4 mr-2" />
                                          ) : null}

                                          <span>{activity}</span>
                                        </CommandItem>
                                      )
                                    } else {
                                      null
                                    }
                                  },
                                )}
                              </CommandGroup>
                            )
                          })}
                          <CommandSeparator />
                        </CommandList>
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
            name="province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Terms</FormLabel>
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
