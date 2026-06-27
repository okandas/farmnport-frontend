"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import * as z from "zod"

import { addBreed, queryFarmProduceByCategory, queryFarmProduceCategories } from "@/lib/query"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { toast } from "@/components/ui/use-toast"
import { handleApiError ,
  handleFormErrors
} from "@/lib/error-handler"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SearchSelect } from "@/components/ui/search-select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"

const inputClass = "block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-primary sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500"

const Schema = z.object({
    name: z.string().min(1, "Name is required"),
    farm_produce_id: z.string().min(1, "Farm produce is required"),
    description: z.string().optional().default(""),
})

type FormModel = z.infer<typeof Schema>

export default function NewBreedPage() {
    const router = useRouter()
    const [categorySlug, setCategorySlug] = useState("")
    const [produceOpen, setProduceOpen] = useState(false)

    const form = useForm<FormModel>({
        defaultValues: { name: "", farm_produce_id: "", description: "" },
        resolver: zodResolver(Schema),
    })

    const watchedFarmProduceId = form.watch("farm_produce_id")

    const { data: produceData } = useQuery({
        queryKey: ["farm-produce-by-category", categorySlug],
        queryFn: () => queryFarmProduceByCategory(categorySlug),
        enabled: !!categorySlug,
        refetchOnWindowFocus: false,
    })

    const farmProduceList = produceData?.data?.data || []
    const selectedProduce = farmProduceList.find((fp: any) => fp.id === watchedFarmProduceId)

    const { mutate, isPending } = useMutation({
        mutationFn: addBreed,
        onSuccess: () => {
            toast({ description: "Breed added" })
            router.push("/dashboard/farmnport/breeds")
        },
        onError: (error) => handleApiError(error, { context: "add breed" }),
    })

    function onSubmit(data: FormModel) {
        mutate(data)
    }

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Add Breed</h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Add a breed or variety to the shared breeds collection.</p>
                </div>
                <Link href="/dashboard/farmnport/breeds" className={cn(buttonVariants({ variant: "ghost" }))}>
                    <Icons.close className="w-4 h-4 mr-2" />Close
                </Link>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit, (errors) => handleFormErrors(errors))}>
                    <div className="space-y-12">
                        <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
                            <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-3">
                                <div>
                                    <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">Breed Details</h2>
                                    <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">Name and produce association for this breed or variety.</p>
                                </div>

                                <div className="md:col-span-2">
                                    <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                                        <div className="sm:col-span-4">
                                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Name</label>
                                            <div className="mt-2">
                                                <FormField control={form.control} name="name" render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl><Input placeholder="e.g. Ross 308, Lohmann Brown, Mondial" className={inputClass} {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Category</label>
                                            <div className="mt-2">
                                                <SearchSelect
                                                    queryKey={["farm-produce-categories-select"]}
                                                    queryFn={(params) => queryFarmProduceCategories(params)}
                                                    getItems={(data) => data?.data?.data ?? []}
                                                    value={categorySlug}
                                                    onValueChange={(val) => {
                                                        setCategorySlug(val)
                                                        form.setValue("farm_produce_id", "")
                                                    }}
                                                    getValue={(item) => item.slug}
                                                    getLabel={(item) => item.name}
                                                    placeholder="Select category"
                                                    searchPlaceholder="Search categories..."
                                                />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-3">
                                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Farm Produce</label>
                                            <div className="mt-2">
                                                <FormField control={form.control} name="farm_produce_id" render={({ field }) => (
                                                    <FormItem>
                                                        <Popover open={produceOpen} onOpenChange={setProduceOpen}>
                                                            <PopoverTrigger asChild>
                                                                <button
                                                                    type="button"
                                                                    disabled={!categorySlug}
                                                                    className={cn(
                                                                        "flex w-full items-center justify-between rounded-md bg-white px-3 py-1.5 text-sm text-left outline outline-1 -outline-offset-1 outline-gray-300 dark:bg-white/5 dark:outline-white/10",
                                                                        !field.value && "text-gray-400 dark:text-gray-500",
                                                                        field.value && "text-gray-900 dark:text-white",
                                                                        !categorySlug && "opacity-50 cursor-not-allowed"
                                                                    )}
                                                                >
                                                                    {selectedProduce?.name || (categorySlug ? "Select produce" : "Select category first")}
                                                                    <ChevronsUpDown className="w-4 h-4 ml-2 shrink-0 opacity-50" />
                                                                </button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-[280px] p-0" align="start">
                                                                <Command>
                                                                    <CommandInput placeholder="Filter produce..." />
                                                                    <CommandList>
                                                                        <CommandEmpty>No produce found.</CommandEmpty>
                                                                        {farmProduceList.map((fp: any) => (
                                                                            <CommandItem key={fp.id} value={fp.name} onSelect={() => {
                                                                                field.onChange(fp.id)
                                                                                setProduceOpen(false)
                                                                            }}>
                                                                                <Check className={cn("mr-2 h-4 w-4", field.value === fp.id ? "opacity-100" : "opacity-0")} />
                                                                                {fp.name}
                                                                            </CommandItem>
                                                                        ))}
                                                                    </CommandList>
                                                                </Command>
                                                            </PopoverContent>
                                                        </Popover>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>

                                        <div className="sm:col-span-6">
                                            <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">Description</label>
                                            <div className="mt-2">
                                                <FormField control={form.control} name="description" render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl><Textarea placeholder="Optional description of this breed or variety" rows={3} className={inputClass} {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-x-6">
                        <button type="button" onClick={() => router.push("/dashboard/farmnport/breeds")}
                            className="text-sm/6 font-semibold text-gray-900 dark:text-white">Cancel</button>
                        <button type="submit" disabled={isPending}
                            className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isPending && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}Save
                        </button>
                    </div>
                </form>
            </Form>
        </div>
    )
}
