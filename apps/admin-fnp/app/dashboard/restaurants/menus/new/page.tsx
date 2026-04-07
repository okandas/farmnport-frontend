"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { addMenu, queryRestaurantLocations, queryMenuItemCategories } from "@/lib/query"
import { FormMenuSchema, FormMenuModel, RestaurantLocation, MenuLocationEntry, MenuItemCategory } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"

export default function NewMenuPage() {
    const router = useRouter()
    const [locationsOpen, setLocationsOpen] = useState(false)

    const { data: locationsData } = useQuery({
        queryKey: ["locations-for-select"],
        queryFn: () => queryRestaurantLocations({}),
        refetchOnWindowFocus: false,
    })

    const locations = (locationsData?.data?.data as RestaurantLocation[]) || []

    const { data: categoriesData } = useQuery({
        queryKey: ["categories-for-notes"],
        queryFn: () => queryMenuItemCategories({ limit: 100 }),
        refetchOnWindowFocus: false,
    })

    const categories = (categoriesData?.data?.data as MenuItemCategory[]) || []

    const form = useForm<FormMenuModel>({
        defaultValues: {
            locations: [],
            name: "",
            note: "",
            status: "active",
            category_notes: {},
        },
        resolver: zodResolver(FormMenuSchema),
    })

    const { mutate, isPending } = useMutation({
        mutationFn: addMenu,
        onSuccess: () => {
            toast({
                description: "Menu added successfully",
            })
            router.push("/dashboard/restaurants/menus")
        },
        onError: (error) => {
            handleApiError(error, {
                context: "menu creation"
            })
        },
    })

    async function onSubmit(data: FormMenuModel) {
        mutate(data)
    }

    function toggleLocation(loc: RestaurantLocation, currentLocations: MenuLocationEntry[]) {
        const exists = currentLocations.some((l) => l.location_id === loc.id)
        if (exists) {
            return currentLocations.filter((l) => l.location_id !== loc.id)
        }
        return [...currentLocations, { location_id: loc.id, location_name: loc.name }]
    }

    return (
        <div className="space-y-10 px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Add Menu
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Create a new menu for a restaurant location.
                    </p>
                </div>
                <Link
                    href="/dashboard/restaurants/menus"
                    className={cn(buttonVariants({ variant: "ghost" }))}
                >
                    <Icons.close className="w-4 h-4 mr-2" />
                    Close
                </Link>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="space-y-12">
                        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
                            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                                Menu Information
                            </h2>
                            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
                                e.g. Breakfast Menu, Lunch Menu, Weekend Special
                            </p>

                            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-4 px-1">
                                    <label
                                        className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                    >
                                        Locations
                                    </label>
                                    <div className="mt-2">
                                        <FormField
                                            control={form.control}
                                            name="locations"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Popover open={locationsOpen} onOpenChange={setLocationsOpen}>
                                                        <PopoverTrigger asChild>
                                                            <button
                                                                type="button"
                                                                role="combobox"
                                                                aria-expanded={locationsOpen}
                                                                className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
                                                            >
                                                                <span className="text-gray-400 dark:text-gray-500">
                                                                    {field.value?.length
                                                                        ? `${field.value.length} location${field.value.length > 1 ? "s" : ""} selected`
                                                                        : "Select locations"}
                                                                </span>
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                                            <Command>
                                                                <CommandInput placeholder="Search locations..." />
                                                                <CommandList>
                                                                    <CommandEmpty>No locations found.</CommandEmpty>
                                                                    <CommandGroup>
                                                                        {locations.map((loc) => {
                                                                            const isSelected = field.value?.some(
                                                                                (l) => l.location_id === loc.id
                                                                            )
                                                                            return (
                                                                                <CommandItem
                                                                                    key={loc.id}
                                                                                    value={loc.name}
                                                                                    onSelect={() => {
                                                                                        field.onChange(
                                                                                            toggleLocation(loc, field.value || [])
                                                                                        )
                                                                                    }}
                                                                                >
                                                                                    <Check
                                                                                        className={cn(
                                                                                            "mr-2 h-4 w-4",
                                                                                            isSelected ? "opacity-100" : "opacity-0"
                                                                                        )}
                                                                                    />
                                                                                    <span className="capitalize">{loc.name}</span>
                                                                                </CommandItem>
                                                                            )
                                                                        })}
                                                                    </CommandGroup>
                                                                </CommandList>
                                                            </Command>
                                                        </PopoverContent>
                                                    </Popover>
                                                    {field.value && field.value.length > 0 && (
                                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                                            {field.value.map((loc) => (
                                                                <Badge
                                                                    key={loc.location_id}
                                                                    variant="secondary"
                                                                    className="capitalize cursor-pointer"
                                                                    onClick={() => {
                                                                        field.onChange(
                                                                            field.value?.filter(
                                                                                (l) => l.location_id !== loc.location_id
                                                                            ) || []
                                                                        )
                                                                    }}
                                                                >
                                                                    {loc.location_name}
                                                                    <X className="ml-1 h-3 w-3" />
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-4 px-1">
                                    <label
                                        htmlFor="name"
                                        className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                    >
                                        Menu Name
                                    </label>
                                    <div className="mt-2">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            id="name"
                                                            placeholder="Enter menu name"
                                                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-4 px-1">
                                    <label
                                        htmlFor="note"
                                        className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                    >
                                        Note
                                    </label>
                                    <div className="mt-2">
                                        <FormField
                                            control={form.control}
                                            name="note"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            id="note"
                                                            placeholder="e.g. Served until 11:00 AM"
                                                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-4 px-1">
                                    <label
                                        className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                    >
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
                            </div>
                        </div>

                        {categories.length > 0 && (
                            <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
                                <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                                    Category Notes
                                </h2>
                                <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
                                    Add notes for specific categories on this menu. e.g. &quot;All steaks are 14-day aged and served with your choice of sides&quot;
                                </p>

                                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                                    {categories.map((cat) => (
                                        <div key={cat.id} className="sm:col-span-4 px-1">
                                            <label
                                                className="block text-sm/6 font-medium text-gray-900 dark:text-white capitalize"
                                            >
                                                {cat.name}
                                            </label>
                                            <div className="mt-2">
                                                <Input
                                                    placeholder={`Note for ${cat.name} (optional)`}
                                                    value={form.watch("category_notes")?.[cat.id] || ""}
                                                    onChange={(e) => {
                                                        const current = form.getValues("category_notes") || {}
                                                        if (e.target.value === "") {
                                                            const { [cat.id]: _, ...rest } = current
                                                            form.setValue("category_notes", rest, { shouldDirty: true })
                                                        } else {
                                                            form.setValue("category_notes", { ...current, [cat.id]: e.target.value }, { shouldDirty: true })
                                                        }
                                                    }}
                                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/restaurants/menus")}
                            className="text-sm/6 font-semibold text-gray-900 dark:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending}
                            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
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
