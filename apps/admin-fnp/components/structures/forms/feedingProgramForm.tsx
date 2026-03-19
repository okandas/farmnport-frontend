"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useDebounce } from "use-debounce"
import { Check, ChevronsUpDown, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react"

import { addFeedingProgram, updateFeedingProgram, queryAllFarmProduce, queryFeedProducts } from "@/lib/query"
import {
    FormFeedingProgramModel,
    FormFeedingProgramSchema,
    FarmProduce,
    FeedProduct,
} from "@/lib/schemas"
import { cn, logFormPayload } from "@/lib/utilities"
import { handleApiError, handleFormErrors } from "@/lib/error-handler"

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons/lucide"
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
import { Checkbox } from "@/components/ui/checkbox"
import { FileInput } from "@/components/structures/controls/file-input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface FeedingProgramFormProps extends React.HTMLAttributes<HTMLDivElement> {
    feedingProgram: FormFeedingProgramModel
    mode?: "create" | "edit"
}

const PURPOSE_OPTIONS = [
    "Growth",
    "Maintenance",
    "Egg Production",
    "Weight Gain",
    "Breeding",
    "Transition",
    "Starter",
    "Finisher",
]

export function FeedingProgramForm({ feedingProgram, mode = "create" }: FeedingProgramFormProps) {
    const isEditMode = mode === "edit" || !!feedingProgram?.id

    const form = useForm({
        defaultValues: {
            id: feedingProgram?.id || "",
            name: feedingProgram?.name || "",
            description: feedingProgram?.description || "",
            farm_produce_id: feedingProgram?.farm_produce_id || "",
            cover_image: feedingProgram?.cover_image || null,
            stages: feedingProgram?.stages || [],
            published: feedingProgram?.published || false,
        },
        resolver: zodResolver(FormFeedingProgramSchema),
    })

    const router = useRouter()

    // Animal type selection state
    const [selectedAnimalName, setSelectedAnimalName] = useState("")
    const [openAnimal, setOpenAnimal] = useState(false)

    // Fetch all farm produce (livestock types)
    const { data: produceData } = useQuery({
        queryKey: ["all-farm-produce"],
        queryFn: () => queryAllFarmProduce(),
        refetchOnWindowFocus: false,
    })

    const farmProduce = (produceData?.data?.data || produceData?.data || []) as FarmProduce[]

    // Set animal name in edit mode
    useEffect(() => {
        if (isEditMode && feedingProgram?.farm_produce_id && farmProduce.length > 0) {
            const produce = farmProduce.find((p: FarmProduce) => p.id === feedingProgram.farm_produce_id)
            if (produce) setSelectedAnimalName(produce.name)
        }
    }, [isEditMode, feedingProgram?.farm_produce_id, farmProduce])

    // Feed product search for recommendations
    const [searchFeedProduct, setSearchFeedProduct] = useState("")
    const [debouncedFeedSearch] = useDebounce(searchFeedProduct, 500)
    const [openFeedProduct, setOpenFeedProduct] = useState(false)
    const [activeStageIdx, setActiveStageIdx] = useState<number | null>(null)

    const { data: feedProductData } = useQuery({
        queryKey: ["search-feed-products", { search: debouncedFeedSearch }],
        queryFn: () => queryFeedProducts({ search: debouncedFeedSearch }),
        enabled: !!debouncedFeedSearch && debouncedFeedSearch.length >= 2,
        refetchOnWindowFocus: false,
    })

    const feedProducts = (feedProductData?.data?.data || []) as FeedProduct[]

    // Mutation
    const { mutate, isPending } = useMutation({
        mutationFn: isEditMode ? updateFeedingProgram : addFeedingProgram,
        onSuccess: () => {
            toast({ description: isEditMode ? "Feeding program updated!" : "Feeding program created!" })
            router.push("/dashboard/feeding-programs")
        },
        onError: (error) => handleApiError(error, { context: "feeding program" }),
    })

    function onSubmit(payload: any) {
        logFormPayload(payload, "feeding-program")
        mutate(payload)
    }

    function onError(errors: any) {
        handleFormErrors(errors)
    }

    // Stage management
    const stages = form.watch("stages") || []

    function addStage() {
        const current = form.getValues("stages") || []
        form.setValue("stages", [
            ...current,
            {
                name: "",
                order: current.length + 1,
                description: "",
                timing_description: "",
                recommendations: [],
            },
        ])
    }

    function removeStage(idx: number) {
        const current = form.getValues("stages") || []
        const updated = current.filter((_: any, i: number) => i !== idx)
            .map((s: any, i: number) => ({ ...s, order: i + 1 }))
        form.setValue("stages", updated)
    }

    function moveStage(idx: number, direction: "up" | "down") {
        const current = [...(form.getValues("stages") || [])]
        const newIdx = direction === "up" ? idx - 1 : idx + 1
        if (newIdx < 0 || newIdx >= current.length) return
        ;[current[idx], current[newIdx]] = [current[newIdx], current[idx]]
        const updated = current.map((s: any, i: number) => ({ ...s, order: i + 1 }))
        form.setValue("stages", updated)
    }

    // Recommendation management
    function addRecommendation(stageIdx: number, feedProduct: FeedProduct) {
        const current = form.getValues("stages") || []
        const stage = { ...current[stageIdx] }
        const existing = stage.recommendations || []

        // Prevent duplicates
        if (existing.some((r: any) => r.feed_product_id === feedProduct.id)) return

        stage.recommendations = [
            ...existing,
            {
                feed_product_id: feedProduct.id,
                feed_product_name: feedProduct.name,
                feed_product_slug: feedProduct.slug || "",
                purpose: "",
                notes: "",
            },
        ]
        const updated = [...current]
        updated[stageIdx] = stage
        form.setValue("stages", updated)
        setOpenFeedProduct(false)
        setSearchFeedProduct("")
    }

    function removeRecommendation(stageIdx: number, recIdx: number) {
        const current = form.getValues("stages") || []
        const stage = { ...current[stageIdx] }
        stage.recommendations = stage.recommendations.filter((_: any, i: number) => i !== recIdx)
        const updated = [...current]
        updated[stageIdx] = stage
        form.setValue("stages", updated)
    }

    function updateRecommendation(stageIdx: number, recIdx: number, field: string, value: any) {
        const current = form.getValues("stages") || []
        const stage = { ...current[stageIdx] }
        const recs = [...stage.recommendations]
        recs[recIdx] = { ...recs[recIdx], [field]: value }
        stage.recommendations = recs
        const updated = [...current]
        updated[stageIdx] = stage
        form.setValue("stages", updated)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-8">
                {/* Basic Information */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Basic Information</h3>

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="e.g., Broiler Feeding Program" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder="Describe the feeding program..." rows={3} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Animal Type Select */}
                    <FormField
                        control={form.control}
                        name="farm_produce_id"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Animal Type</FormLabel>
                                <Popover open={openAnimal} onOpenChange={setOpenAnimal}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                    "w-full justify-between",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? selectedAnimalName : "Select animal type"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Search animal type..." />
                                            <CommandList>
                                                <CommandEmpty>No animal type found</CommandEmpty>
                                                {farmProduce.map((produce: FarmProduce) => (
                                                    <CommandItem
                                                        value={produce.name}
                                                        key={produce.id}
                                                        onSelect={() => {
                                                            form.setValue("farm_produce_id", produce.id)
                                                            setSelectedAnimalName(produce.name)
                                                            setOpenAnimal(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                produce.id === field.value ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        <span className="capitalize">{produce.name}</span>
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

                    {/* Published */}
                    <FormField
                        control={form.control}
                        name="published"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>Published</FormLabel>
                                    <p className="text-sm text-muted-foreground">
                                        Make this feeding program visible to the public
                                    </p>
                                </div>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Cover Image */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Cover Image</h3>
                    <FormField
                        control={form.control}
                        name="cover_image"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <FileInput
                                        value={field.value ? [field.value] : []}
                                        fieldName="cover_image"
                                        onChange={(images: any) => {
                                            field.onChange(images && images.length > 0 ? images[0] : null)
                                        }}
                                        maxImages={1}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Stages */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Feeding Stages</h3>
                        <Button type="button" variant="outline" size="sm" onClick={addStage}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Stage
                        </Button>
                    </div>

                    {stages.length === 0 && (
                        <p className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg border text-center">
                            No stages added yet. Click &quot;Add Stage&quot; to begin building the feeding program.
                        </p>
                    )}

                    {stages.map((stage: any, stageIdx: number) => (
                        <div key={stageIdx} className={`border rounded-lg p-4 space-y-4 ${stageIdx % 2 === 0 ? "bg-background" : "bg-green-50 dark:bg-green-950/20"}`}>
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-sm">
                                    Stage {stageIdx + 1}
                                    {stage.name && `: ${stage.name}`}
                                </h4>
                                <div className="flex items-center gap-1">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => moveStage(stageIdx, "up")}
                                        disabled={stageIdx === 0}
                                    >
                                        <ChevronUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => moveStage(stageIdx, "down")}
                                        disabled={stageIdx === stages.length - 1}
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive"
                                        onClick={() => removeStage(stageIdx)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Stage Name</label>
                                    <Input
                                        value={stage.name || ""}
                                        onChange={(e) => {
                                            const current = [...(form.getValues("stages") || [])]
                                            current[stageIdx] = { ...current[stageIdx], name: e.target.value }
                                            form.setValue("stages", current)
                                        }}
                                        placeholder="e.g., Starter Phase (Day 1-14)"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Timing</label>
                                    <Input
                                        value={stage.timing_description || ""}
                                        onChange={(e) => {
                                            const current = [...(form.getValues("stages") || [])]
                                            current[stageIdx] = { ...current[stageIdx], timing_description: e.target.value }
                                            form.setValue("stages", current)
                                        }}
                                        placeholder="e.g., Day 1 to Day 14"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={stage.description || ""}
                                    onChange={(e) => {
                                        const current = [...(form.getValues("stages") || [])]
                                        current[stageIdx] = { ...current[stageIdx], description: e.target.value }
                                        form.setValue("stages", current)
                                    }}
                                    placeholder="Describe what happens at this stage..."
                                    rows={2}
                                />
                            </div>

                            {/* Recommendations */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Feed Products / Recommendations</label>
                                    <Popover
                                        open={openFeedProduct && activeStageIdx === stageIdx}
                                        onOpenChange={(o) => {
                                            setOpenFeedProduct(o)
                                            setActiveStageIdx(o ? stageIdx : null)
                                        }}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button type="button" variant="outline" size="sm">
                                                <Plus className="mr-1 h-3 w-3" />
                                                Add Feed Product
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80 p-0" align="end">
                                            <Command>
                                                <CommandInput
                                                    placeholder="Search feed product..."
                                                    onValueChange={setSearchFeedProduct}
                                                />
                                                <CommandList>
                                                    <CommandEmpty>
                                                        {debouncedFeedSearch.length < 2
                                                            ? "Type at least 2 characters"
                                                            : "No feed product found"}
                                                    </CommandEmpty>
                                                    {feedProducts.map((fp: FeedProduct) => (
                                                        <CommandItem
                                                            value={fp.name}
                                                            key={fp.id}
                                                            onSelect={() => addRecommendation(stageIdx, fp)}
                                                        >
                                                            <span className="capitalize">{fp.name}</span>
                                                        </CommandItem>
                                                    ))}
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {(!stage.recommendations || stage.recommendations.length === 0) && (
                                    <p className="text-xs text-muted-foreground p-3 bg-muted/20 rounded border border-dashed text-center">
                                        No feed products added. Search and add feed products for this stage.
                                    </p>
                                )}

                                {stage.recommendations?.map((rec: any, recIdx: number) => (
                                    <div key={recIdx} className="border rounded-lg p-3 space-y-3 bg-background">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-sm capitalize">{rec.feed_product_name}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-destructive"
                                                onClick={() => removeRecommendation(stageIdx, recIdx)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-xs font-medium">Purpose</label>
                                                <Select
                                                    value={rec.purpose}
                                                    onValueChange={(v) => updateRecommendation(stageIdx, recIdx, "purpose", v)}
                                                >
                                                    <SelectTrigger className="h-8 text-xs">
                                                        <SelectValue placeholder="Select purpose" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {PURPOSE_OPTIONS.map((p) => (
                                                            <SelectItem key={p} value={p}>{p}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium">Notes</label>
                                                <Input
                                                    value={rec.notes || ""}
                                                    onChange={(e) => updateRecommendation(stageIdx, recIdx, "notes", e.target.value)}
                                                    placeholder="Additional notes..."
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit */}
                <Button type="submit" disabled={isPending}>
                    {isPending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditMode ? "Update Feeding Program" : "Create Feeding Program"}
                </Button>
            </form>
        </Form>
    )
}
