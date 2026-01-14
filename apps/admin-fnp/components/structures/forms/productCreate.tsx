"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { useForm, FieldErrors } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useDebounce } from "use-debounce"
import { Check, ChevronsUpDown } from "lucide-react"

import { addAgroChemical, queryBrands } from "@/lib/query"
import {
    FormAgroChemicalModel,
    FormAgroChemicalSchema,
    Brand,
} from "@/lib/schemas"
import { cn } from "@/lib/utilities"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons/lucide"
import { buttonVariants } from "@/components/ui/button"
import {
    Command,
    CommandInput,
    CommandItem,
    CommandList,
    CommandEmpty,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

interface EditFormProps extends React.HTMLAttributes<HTMLDivElement> {
    product: FormAgroChemicalModel
}

export function CreateAgroChemicalForm({ product }: EditFormProps) {

    const form = useForm<FormAgroChemicalModel>({
        defaultValues: {
            id: product?.id,
            name: product?.name,
            brand_id: product?.brand_id,
            front_label: product?.front_label,
            back_label: product?.back_label,
            images: product?.images || [],
            active_ingredients: product?.active_ingredients || [],
            dosage_rates: product?.dosage_rates || [],
        },
        resolver: zodResolver(FormAgroChemicalSchema),
    })

    const router = useRouter()

    const [searchBrand, setSearchBrand] = useState("")
    const [selectedBrand, setSelectedBrand] = useState("")
    const [open, setOpen] = useState(false)

    // Debounce search query
    const [debouncedSearchQuery] = useDebounce(searchBrand, 1000)
    const enabled = !!debouncedSearchQuery

    const { data, isError, refetch } = useQuery({
        queryKey: ["dashboard-brands", { search: debouncedSearchQuery }],
        queryFn: () =>
            queryBrands({
                search: debouncedSearchQuery,
            }),
        enabled,
    })

    const brands = data?.data?.data as Brand[]

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
                        title: "Uh oh! Failed to fetch brands.",
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

    const { mutate, isPending } = useMutation({
        mutationFn: addAgroChemical,
        onSuccess: () => {
            toast({
                description: "Added AgroChemical Successfully",
            })

            router.push(`/dashboard/agrochemicals`)
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
                            title: "Uh oh! agro chemical creation failed.",
                            description: "There was a problem with your request.",
                            action: <ToastAction altText="Try again">Try again</ToastAction>,
                        })
                        break
                }
            }
        },

    })

    async function onSubmit(payload: FormAgroChemicalModel) {
        mutate(payload)
    }

    const onError = (errors: FieldErrors<FormAgroChemicalModel>) => {
        console.log(errors)
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit, onError)}
                className="space-y-12 sm:space-y-16"
            >
                <div>
                    <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                        AgroChemical Information
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm/6 text-gray-600 dark:text-gray-400">
                        Add a new agro chemical product to the system.
                    </p>

                    <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:border-t-gray-900/10 sm:pb-0 dark:border-white/10 dark:sm:divide-white/10 dark:sm:border-t-white/10">
                        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                            <label
                                htmlFor="name"
                                className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white"
                            >
                                Name
                            </label>
                            <div className="mt-2 sm:col-span-2 sm:mt-0">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    id="name"
                                                    placeholder="Product name"
                                                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:max-w-md sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:py-6">
                            <label
                                htmlFor="brand"
                                className="block text-sm/6 font-medium text-gray-900 sm:pt-1.5 dark:text-white"
                            >
                                Brand
                            </label>
                            <div className="mt-2 sm:col-span-2 sm:mt-0">
                                <FormField
                                    control={form.control}
                                    name="brand_id"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <Popover open={open} onOpenChange={setOpen}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className={cn(
                                                                "w-full justify-between sm:max-w-md",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value
                                                                ? selectedBrand
                                                                : "Select brand"}
                                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                                    <Command>
                                                        <CommandInput
                                                            placeholder="Search brand..."
                                                            onValueChange={(value) => {
                                                                setSearchBrand(value)
                                                            }}
                                                        />
                                                        <CommandList>
                                                            <CommandEmpty>
                                                                {searchBrand.length < 2
                                                                    ? "Type at least 2 characters to search"
                                                                    : "No brand found."}
                                                            </CommandEmpty>
                                                            {brands?.map((brand) => (
                                                                <CommandItem
                                                                    value={brand.name}
                                                                    key={brand.id}
                                                                    onSelect={() => {
                                                                        form.setValue("brand_id", brand.id)
                                                                        setSelectedBrand(brand.name)
                                                                        setOpen(false)
                                                                    }}
                                                                >
                                                                    <Check
                                                                        className={cn(
                                                                            "mr-2 h-4 w-4",
                                                                            brand.id === field.value
                                                                                ? "opacity-100"
                                                                                : "opacity-0"
                                                                        )}
                                                                    />
                                                                    {brand.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button
                        type="button"
                        onClick={() => router.push('/dashboard/agrochemicals')}
                        className="text-sm/6 font-semibold text-gray-900 dark:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                    >
                        {isPending && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}
                        Add AgroChemical
                    </button>
                </div>
            </form>
        </Form>
    )
}
