"use client"

import { use } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useForm, useFieldArray } from "react-hook-form"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"

import { updateRestaurantLocation, queryRestaurantLocation, queryRestaurants } from "@/lib/query"
import { z } from "zod"
import { RestaurantLocationSchema, RestaurantLocation, Restaurant } from "@/lib/schemas"
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
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const LocationPicker = dynamic(
    () => import("@/components/ui/location-picker").then((mod) => mod.LocationPicker),
    { ssr: false }
)

const inputClass = "block w-full rounded-md bg-white px-3.5 py-2.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"

const EditFormSchema = RestaurantLocationSchema.pick({
    id: true,
    restaurant_id: true,
    name: true,
    address: true,
    city: true,
    phone: true,
    email: true,
    latitude: true,
    longitude: true,
    place_id: true,
    operating_hours: true,
    status: true,
    is_main: true,
    whatsapp_available: true,
    show_number: true,
}).extend({
    city: z.string().min(1, "City is required"),
})

type EditFormModel = typeof EditFormSchema._type

const defaultHours = [
    { day: "Monday", open: "07:00", close: "23:00", closed: false },
    { day: "Tuesday", open: "07:00", close: "23:00", closed: false },
    { day: "Wednesday", open: "07:00", close: "23:00", closed: false },
    { day: "Thursday", open: "07:00", close: "23:00", closed: false },
    { day: "Friday", open: "07:00", close: "23:00", closed: false },
    { day: "Saturday", open: "07:00", close: "23:00", closed: false },
    { day: "Sunday", open: "07:00", close: "23:00", closed: false },
]

// Wrapper that fetches data, then renders the form only when ready
export default function EditRestaurantLocationPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = use(params)

    const { data: locationData, isLoading: isLoadingLocation } = useQuery({
        queryKey: ["restaurant-location", slug],
        queryFn: () => queryRestaurantLocation(slug),
    })

    const location = locationData?.data as RestaurantLocation

    const { data: restaurantsData, isLoading: isLoadingRestaurants } = useQuery({
        queryKey: ["restaurants-for-select"],
        queryFn: () => queryRestaurants({ limit: 200 }),
        refetchOnWindowFocus: false,
    })

    const restaurants = (restaurantsData?.data?.data as Restaurant[]) || []

    if (isLoadingLocation || isLoadingRestaurants) {
        return (
            <div className="flex justify-center py-12">
                <Icons.spinner className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        )
    }

    if (!location) {
        return (
            <div className="text-center py-12">
                <p className="text-sm text-red-600 dark:text-red-400">
                    Location not found.
                </p>
            </div>
        )
    }

    return <EditLocationForm location={location} restaurants={restaurants} />
}

// Form component — only mounts after data is loaded, so defaultValues are correct from the start
function EditLocationForm({ location, restaurants }: { location: RestaurantLocation; restaurants: Restaurant[] }) {
    const router = useRouter()

    const form = useForm<EditFormModel>({
        defaultValues: {
            id: location.id,
            restaurant_id: location.restaurant_id,
            name: location.name,
            address: location.address,
            city: location.city ?? "",
            phone: location.phone,
            email: location.email ?? "",
            latitude: Number(location.latitude) || 0,
            longitude: Number(location.longitude) || 0,
            place_id: location.place_id ?? "",
            status: location.status,
            is_main: location.is_main || false,
            whatsapp_available: location.whatsapp_available || false,
            show_number: location.show_number || false,
            operating_hours: location.operating_hours?.length ? location.operating_hours : defaultHours,
        },
        resolver: zodResolver(EditFormSchema),
    })

    const { fields } = useFieldArray({
        control: form.control,
        name: "operating_hours",
    })

    const { mutate, isPending } = useMutation({
        mutationFn: updateRestaurantLocation,
        onSuccess: () => {
            toast({
                description: "Location updated successfully",
            })
            router.push("/dashboard/restaurants/locations")
        },
        onError: (error) => {
            handleApiError(error, {
                context: "location update"
            })
        },
    })

    async function onSubmit(data: EditFormModel) {
        mutate(data)
    }

    return (
        <div className="space-y-10 px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Edit Location
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Update the location details for {location.restaurant_name || "this restaurant"}.
                    </p>
                </div>
                <Link
                    href="/dashboard/restaurants/locations"
                    className={cn(buttonVariants({ variant: "ghost" }))}
                >
                    <Icons.close className="w-4 h-4 mr-2" />
                    Close
                </Link>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="space-y-12">

                        {/* Section 1: Location Details */}
                        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
                            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                                Location Details
                            </h2>
                            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
                                Basic information about this restaurant branch.
                            </p>

                            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                        Restaurant
                                    </label>
                                    <div className="mt-2">
                                        <FormField
                                            control={form.control}
                                            name="restaurant_id"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select a restaurant" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {restaurants.map((r) => (
                                                                <SelectItem key={r.id} value={r.id}>
                                                                    <span className="capitalize">{r.name}</span>
                                                                </SelectItem>
                                                            ))}
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
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="w-full">
                                                                <SelectValue placeholder="Select status" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="active">Active</SelectItem>
                                                            <SelectItem value="inactive">Inactive</SelectItem>
                                                            <SelectItem value="closed">Closed</SelectItem>
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

                        {/* Branch Perks (read-only) */}
                        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
                            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                                Branch Perks
                            </h2>
                            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
                                {location.is_main
                                    ? "This is the main branch. These perks are included in the free tier."
                                    : "This is not the main branch. Upgrade to enable these perks."
                                }
                            </p>

                            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                                <div className="sm:col-span-2">
                                    <FormField
                                        control={form.control}
                                        name="is_main"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={(checked) => {
                                                            field.onChange(checked)
                                                            form.setValue("whatsapp_available", !!checked)
                                                            form.setValue("show_number", !!checked)
                                                        }}
                                                    />
                                                </FormControl>
                                                <FormLabel className="text-sm font-medium cursor-pointer text-gray-900 dark:text-white">
                                                    Main Branch
                                                </FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <FormField
                                        control={form.control}
                                        name="whatsapp_available"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <FormLabel className="text-sm font-medium cursor-pointer text-gray-900 dark:text-white">
                                                    WhatsApp Available
                                                </FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <FormField
                                        control={form.control}
                                        name="show_number"
                                        render={({ field }) => (
                                            <FormItem className="flex items-center space-x-2 space-y-0">
                                                <FormControl>
                                                    <Checkbox
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <FormLabel className="text-sm font-medium cursor-pointer text-gray-900 dark:text-white">
                                                    Show Phone Number
                                                </FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: GPS Location */}
                        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
                            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                                GPS Location <span className="text-gray-400 font-normal text-sm">(optional)</span>
                            </h2>
                            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
                                Search for the location or click on the map to pin it. This auto-fills the name, address and coordinates.
                            </p>

                            <div className="mt-10 space-y-6">
                                <div className="col-span-full">
                                    <LocationPicker
                                        latitude={location.latitude || 0}
                                        longitude={location.longitude || 0}
                                        defaultValue={location.name}
                                        onSelect={(data) => {
                                            if (data.name) {
                                                form.setValue("name", data.name)
                                            }
                                            if (data.address) {
                                                form.setValue("address", data.address)
                                            }
                                            if (data.city) {
                                                form.setValue("city", data.city)
                                            }
                                            form.setValue("latitude", data.latitude)
                                            form.setValue("longitude", data.longitude)
                                            if (data.place_id) {
                                                form.setValue("place_id", data.place_id)
                                            }
                                        }}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                    <div className="sm:col-span-4">
                                        <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                            Location Name
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
                                                                placeholder="e.g. CBD Branch, Avondale"
                                                                className={inputClass}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <p className="mt-2 text-sm/6 text-gray-500 dark:text-gray-400">
                                            Auto-filled from Google Places. You can edit it.
                                        </p>
                                    </div>

                                    <div className="col-span-full">
                                        <label htmlFor="address" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                            Address
                                        </label>
                                        <div className="mt-2">
                                            <FormField
                                                control={form.control}
                                                name="address"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                id="address"
                                                                placeholder="Enter full address"
                                                                className={inputClass}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <p className="mt-2 text-sm/6 text-gray-500 dark:text-gray-400">
                                            Auto-filled from Google Places. You can edit it.
                                        </p>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="latitude" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                            Latitude
                                        </label>
                                        <div className="mt-2">
                                            <FormField
                                                control={form.control}
                                                name="latitude"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                id="latitude"
                                                                type="number"
                                                                step="any"
                                                                placeholder="e.g. -17.8292"
                                                                className={inputClass}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="longitude" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                            Longitude
                                        </label>
                                        <div className="mt-2">
                                            <FormField
                                                control={form.control}
                                                name="longitude"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                id="longitude"
                                                                type="number"
                                                                step="any"
                                                                placeholder="e.g. 31.0522"
                                                                className={inputClass}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-3">
                                        <label htmlFor="city" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                            City
                                        </label>
                                        <div className="mt-2">
                                            <FormField
                                                control={form.control}
                                                name="city"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                id="city"
                                                                placeholder="e.g. Harare, Bulawayo"
                                                                className={inputClass}
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <p className="mt-2 text-sm/6 text-gray-500 dark:text-gray-400">
                                            Auto-filled from Google Places. You can edit it.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Contact Information */}
                        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
                            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                                Contact Information
                            </h2>
                            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
                                How customers can reach this location.
                            </p>

                            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                                <div className="sm:col-span-3">
                                    <label htmlFor="phone" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                        Phone Number
                                    </label>
                                    <div className="mt-2">
                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            id="phone"
                                                            placeholder="Enter phone number"
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

                                <div className="sm:col-span-3">
                                    <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                        Email <span className="text-gray-400 font-normal">(optional)</span>
                                    </label>
                                    <div className="mt-2">
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input
                                                            id="email"
                                                            type="email"
                                                            placeholder="e.g. info@restaurant.co.zw"
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
                            </div>
                        </div>

                        {/* Section 4: Operating Hours */}
                        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
                            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                                Operating Hours
                            </h2>
                            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
                                Set the opening and closing times for each day of the week.
                            </p>

                            <div className="mt-10 space-y-4">
                                {fields.map((field, index) => {
                                    const isClosed = form.watch(`operating_hours.${index}.closed`)
                                    return (
                                        <div key={field.id} className="flex items-center gap-x-4">
                                            <span className="w-28 text-sm font-medium text-gray-900 dark:text-white">
                                                {field.day}
                                            </span>
                                            <FormField
                                                control={form.control}
                                                name={`operating_hours.${index}.open`}
                                                render={({ field: f }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                type="time"
                                                                disabled={isClosed}
                                                                className="w-32 rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 disabled:opacity-50 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-indigo-500"
                                                                {...f}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <span className="text-sm text-gray-500 dark:text-gray-400">to</span>
                                            <FormField
                                                control={form.control}
                                                name={`operating_hours.${index}.close`}
                                                render={({ field: f }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                type="time"
                                                                disabled={isClosed}
                                                                className="w-32 rounded-md bg-white px-3 py-1.5 text-sm text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 disabled:opacity-50 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:focus:outline-indigo-500"
                                                                {...f}
                                                            />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`operating_hours.${index}.closed`}
                                                render={({ field: f }) => (
                                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                                        <FormControl>
                                                            <Checkbox
                                                                checked={f.value}
                                                                onCheckedChange={f.onChange}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="text-sm font-normal cursor-pointer text-gray-600 dark:text-gray-400">
                                                            Closed
                                                        </FormLabel>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button
                            type="button"
                            onClick={() => router.push("/dashboard/restaurants/locations")}
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
