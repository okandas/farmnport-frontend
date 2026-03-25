"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { useDebounce } from "use-debounce"

import { addCropGroup, queryFarmProduce } from "@/lib/query"
import { FarmProduce } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { toast } from "@/components/ui/use-toast"
import { handleApiError, handleFetchError } from "@/lib/error-handler"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"

export default function NewCropGroupPage() {
    const router = useRouter()

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [selectedCrops, setSelectedCrops] = useState<Array<{ id: string; name: string }>>([])
    const [searchCrop, setSearchCrop] = useState("")
    const [openCrops, setOpenCrops] = useState(false)

    const [debouncedCropQuery] = useDebounce(searchCrop, 1000)

    const hasShownError = useRef(false)

    const { data: cropData, isError: cropError, error: cropFetchError, refetch: cropRefetch } = useQuery({
        queryKey: ["farm-produce-search", { search: debouncedCropQuery }],
        queryFn: () => queryFarmProduce({ search: debouncedCropQuery }),
        enabled: debouncedCropQuery.length >= 2,
        refetchOnWindowFocus: false
    })

    useEffect(() => {
        if (cropError && !hasShownError.current) {
            hasShownError.current = true
            handleFetchError(cropFetchError, {
                onRetry: () => {
                    hasShownError.current = false
                    cropRefetch()
                },
                context: "farm produce"
            })
        }
        if (!cropError) {
            hasShownError.current = false
        }
    }, [cropError, cropFetchError, cropRefetch])

    const farmProduceList = cropData?.data?.data as FarmProduce[]

    const handleToggleCrop = (crop: FarmProduce) => {
        const exists = selectedCrops.find(c => c.id === crop.id)
        if (exists) {
            setSelectedCrops(selectedCrops.filter(c => c.id !== crop.id))
        } else {
            setSelectedCrops([...selectedCrops, { id: crop.id, name: crop.name }])
        }
    }

    const { mutate, isPending } = useMutation({
        mutationFn: addCropGroup,
        onSuccess: () => {
            toast({
                description: "Crop group added successfully",
            })
            router.push("/dashboard/farmnport/crop-groups")
        },
        onError: (error) => {
            handleApiError(error, {
                context: "crop group creation"
            })
        },
    })

    function onSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!name.trim()) {
            toast({ description: "Name is required", variant: "destructive" })
            return
        }

        if (selectedCrops.length === 0) {
            toast({ description: "At least one crop is required", variant: "destructive" })
            return
        }

        mutate({
            name: name.trim(),
            description: description.trim(),
            farm_produce_ids: selectedCrops.map(c => c.id),
        })
    }

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Add Crop Group
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Create a new crop group for batch dosage rate entry.
                    </p>
                </div>
                <Link
                    href="/dashboard/farmnport/crop-groups"
                    className={cn(buttonVariants({ variant: "ghost" }))}
                >
                    <Icons.close className="w-4 h-4 mr-2" />
                    Close
                </Link>
            </div>

            <form onSubmit={onSubmit}>
                <div className="space-y-12">
                    <div className="border-b border-gray-900/10 pb-12 dark:border-white/10">
                        <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                            Group Information
                        </h2>
                        <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
                            Crop groups let you apply the same dosage rate to multiple crops at once (e.g., Cucurbits, Brassicas).
                        </p>

                        <div className="mt-10 space-y-8">
                            <div className="px-1">
                                <label
                                    htmlFor="name"
                                    className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                >
                                    Group Name
                                </label>
                                <div className="mt-2">
                                    <Input
                                        id="name"
                                        placeholder="e.g., Cucurbits, Brassicas, Stone Fruits"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                    />
                                </div>
                                <p className="mt-3 text-sm/6 text-gray-600 dark:text-gray-400">
                                    Enter a name for this crop group.
                                </p>
                            </div>

                            <div className="px-1">
                                <label
                                    htmlFor="description"
                                    className="block text-sm/6 font-medium text-gray-900 dark:text-white"
                                >
                                    Description
                                </label>
                                <div className="mt-2">
                                    <Textarea
                                        id="description"
                                        placeholder="Describe this crop group"
                                        rows={3}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                    />
                                </div>
                                <p className="mt-3 text-sm/6 text-gray-600 dark:text-gray-400">
                                    Optional description (max 500 characters).
                                </p>
                            </div>

                            <div className="px-1">
                                <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                    Crops in this Group
                                </label>

                                {selectedCrops.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2 mb-3">
                                        {selectedCrops.map(crop => (
                                            <span
                                                key={crop.id}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40"
                                                onClick={() => setSelectedCrops(selectedCrops.filter(c => c.id !== crop.id))}
                                            >
                                                {crop.name}
                                                <Icons.close className="w-3 h-3" />
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <Popover open={openCrops} onOpenChange={setOpenCrops}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openCrops}
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <Icons.search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                            Search and add crops...
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-full p-0" align="start">
                                        <Command shouldFilter={false}>
                                            <CommandInput
                                                placeholder="Type crop name (min 2 chars)..."
                                                value={searchCrop}
                                                onValueChange={setSearchCrop}
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    {debouncedCropQuery.length < 2
                                                        ? "Type at least 2 characters to search"
                                                        : "No crops found"
                                                    }
                                                </CommandEmpty>
                                                {farmProduceList?.map((crop) => {
                                                    const isSelected = selectedCrops.some(c => c.id === crop.id)
                                                    return (
                                                        <CommandItem
                                                            key={crop.id}
                                                            value={crop.id}
                                                            onSelect={() => handleToggleCrop(crop)}
                                                        >
                                                            <span className={cn(
                                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                                                                isSelected
                                                                    ? "bg-primary border-primary text-primary-foreground"
                                                                    : "border-gray-300 dark:border-gray-600"
                                                            )}>
                                                                {isSelected && <Icons.check className="w-3 h-3" />}
                                                            </span>
                                                            {crop.name}
                                                        </CommandItem>
                                                    )
                                                })}
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <p className="mt-3 text-sm/6 text-gray-600 dark:text-gray-400">
                                    Select the crops that belong to this group. At least one crop is required.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button
                        type="button"
                        onClick={() => router.push("/dashboard/farmnport/crop-groups")}
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
        </div>
    )
}
