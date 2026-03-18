"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useDebounce } from "use-debounce"
import { Check, ChevronsUpDown, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react"

import { addSprayProgram, updateSprayProgram, queryAllFarmProduce, queryAgroChemicals } from "@/lib/query"
import {
    FormSprayProgramModel,
    FormSprayProgramSchema,
    FarmProduce,
    AgroChemicalItem,
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

interface SprayProgramFormProps extends React.HTMLAttributes<HTMLDivElement> {
    sprayProgram: FormSprayProgramModel
    mode?: "create" | "edit"
}

const PURPOSE_OPTIONS = [
    "Weed Control",
    "Insect Control",
    "Disease Prevention",
    "Disease Control",
    "Growth Regulation",
    "Nutrient Management",
    "Soil Treatment",
    "Seed Treatment",
]

const APPLICATION_METHODS = [
    "Foliar spray",
    "Soil drench",
    "Seed treatment",
    "Band application",
    "Broadcasting",
    "Spot treatment",
    "Dipping",
]


export function SprayProgramForm({ sprayProgram, mode = "create" }: SprayProgramFormProps) {
    const isEditMode = mode === "edit" || !!sprayProgram?.id

    const form = useForm({
        defaultValues: {
            id: sprayProgram?.id || "",
            name: sprayProgram?.name || "",
            description: sprayProgram?.description || "",
            farm_produce_id: sprayProgram?.farm_produce_id || "",
            cover_image: sprayProgram?.cover_image || null,
            stages: sprayProgram?.stages || [],
            published: sprayProgram?.published || false,
        },
        resolver: zodResolver(FormSprayProgramSchema),
    })

    const router = useRouter()

    // Crop selection state
    const [selectedCropName, setSelectedCropName] = useState("")
    const [openCrop, setOpenCrop] = useState(false)

    // Fetch all crops
    const { data: cropData } = useQuery({
        queryKey: ["all-farm-produce"],
        queryFn: () => queryAllFarmProduce(),
        refetchOnWindowFocus: false,
    })

    const crops = (cropData?.data?.data || cropData?.data || []) as FarmProduce[]

    // Set crop name in edit mode
    useEffect(() => {
        if (isEditMode && sprayProgram?.farm_produce_id && crops.length > 0) {
            const crop = crops.find((c: FarmProduce) => c.id === sprayProgram.farm_produce_id)
            if (crop) setSelectedCropName(crop.name)
        }
    }, [isEditMode, sprayProgram?.farm_produce_id, crops])

    // Agrochemical search for recommendations
    const [searchAgroChemical, setSearchAgroChemical] = useState("")
    const [debouncedAgroSearch] = useDebounce(searchAgroChemical, 500)
    const [openAgroChemical, setOpenAgroChemical] = useState(false)
    const [activeStageIdx, setActiveStageIdx] = useState<number | null>(null)

    const { data: agroChemicalData } = useQuery({
        queryKey: ["search-agrochemicals", { search: debouncedAgroSearch }],
        queryFn: () => queryAgroChemicals({ search: debouncedAgroSearch }),
        enabled: !!debouncedAgroSearch && debouncedAgroSearch.length >= 2,
        refetchOnWindowFocus: false,
    })

    const agroChemicals = (agroChemicalData?.data?.data || []) as AgroChemicalItem[]

    // Mutation
    const { mutate, isPending } = useMutation({
        mutationFn: isEditMode ? updateSprayProgram : addSprayProgram,
        onSuccess: () => {
            toast({ description: isEditMode ? "Spray program updated!" : "Spray program created!" })
            router.push("/dashboard/spray-programs")
        },
        onError: (error) => handleApiError(error, { context: "spray program" }),
    })

    function onSubmit(payload: any) {
        logFormPayload(payload, "spray-program")
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
    function addRecommendation(stageIdx: number, agroChemical: AgroChemicalItem) {
        const current = form.getValues("stages") || []
        const stage = { ...current[stageIdx] }
        const existing = stage.recommendations || []

        // Prevent duplicates
        if (existing.some((r: any) => r.agrochemical_id === agroChemical.id)) return

        stage.recommendations = [
            ...existing,
            {
                agrochemical_id: agroChemical.id,
                agrochemical_name: agroChemical.name,
                agrochemical_slug: agroChemical.slug || "",
                purpose: "",
                dosage: { value: "", unit: "", per: "" },
                application_method: "",
                notes: "",
            },
        ]
        const updated = [...current]
        updated[stageIdx] = stage
        form.setValue("stages", updated)
        setOpenAgroChemical(false)
        setSearchAgroChemical("")
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
        if (field.startsWith("dosage.")) {
            const dosageField = field.split(".")[1]
            recs[recIdx] = { ...recs[recIdx], dosage: { ...recs[recIdx].dosage, [dosageField]: value } }
        } else {
            recs[recIdx] = { ...recs[recIdx], [field]: value }
        }
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
                                    <Input {...field} placeholder="e.g., Tomato Spray Program" />
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
                                    <Textarea {...field} placeholder="Describe the spray program..." rows={3} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Crop Select */}
                    <FormField
                        control={form.control}
                        name="farm_produce_id"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Crop</FormLabel>
                                <Popover open={openCrop} onOpenChange={setOpenCrop}>
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
                                                {field.value ? selectedCropName : "Select crop"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                        <Command>
                                            <CommandInput placeholder="Search crop..." />
                                            <CommandList>
                                                <CommandEmpty>No crop found</CommandEmpty>
                                                {crops.map((crop: FarmProduce) => (
                                                    <CommandItem
                                                        value={crop.name}
                                                        key={crop.id}
                                                        onSelect={() => {
                                                            form.setValue("farm_produce_id", crop.id)
                                                            setSelectedCropName(crop.name)
                                                            setOpenCrop(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                crop.id === field.value ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        <span className="capitalize">{crop.name}</span>
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
                                        Make this spray program visible to the public
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
                        <h3 className="text-lg font-semibold">Growth Stages</h3>
                        <Button type="button" variant="outline" size="sm" onClick={addStage}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Stage
                        </Button>
                    </div>

                    {stages.length === 0 && (
                        <p className="text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg border text-center">
                            No stages added yet. Click &quot;Add Stage&quot; to begin building the spray program.
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
                                        placeholder="e.g., Pre-planting"
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
                                        placeholder="e.g., 0-7 days after planting"
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
                                    <label className="text-sm font-medium">Products / Recommendations</label>
                                    <Popover
                                        open={openAgroChemical && activeStageIdx === stageIdx}
                                        onOpenChange={(o) => {
                                            setOpenAgroChemical(o)
                                            setActiveStageIdx(o ? stageIdx : null)
                                        }}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button type="button" variant="outline" size="sm">
                                                <Plus className="mr-1 h-3 w-3" />
                                                Add Product
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80 p-0" align="end">
                                            <Command>
                                                <CommandInput
                                                    placeholder="Search agrochemical..."
                                                    onValueChange={setSearchAgroChemical}
                                                />
                                                <CommandList>
                                                    <CommandEmpty>
                                                        {debouncedAgroSearch.length < 2
                                                            ? "Type at least 2 characters"
                                                            : "No agrochemical found"}
                                                    </CommandEmpty>
                                                    {agroChemicals.map((ac: AgroChemicalItem) => (
                                                        <CommandItem
                                                            value={ac.name}
                                                            key={ac.id}
                                                            onSelect={() => addRecommendation(stageIdx, ac)}
                                                        >
                                                            <span className="capitalize">{ac.name}</span>
                                                        </CommandItem>
                                                    ))}
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {(!stage.recommendations || stage.recommendations.length === 0) && (
                                    <p className="text-xs text-muted-foreground p-3 bg-muted/20 rounded border border-dashed text-center">
                                        No products added. Search and add agrochemicals for this stage.
                                    </p>
                                )}

                                {stage.recommendations?.map((rec: any, recIdx: number) => (
                                    <div key={recIdx} className="border rounded-lg p-3 space-y-3 bg-background">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-sm capitalize">{rec.agrochemical_name}</span>
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
                                                <label className="text-xs font-medium">Application Method</label>
                                                <Select
                                                    value={rec.application_method}
                                                    onValueChange={(v) => updateRecommendation(stageIdx, recIdx, "application_method", v)}
                                                >
                                                    <SelectTrigger className="h-8 text-xs">
                                                        <SelectValue placeholder="Select method" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {APPLICATION_METHODS.map((m) => (
                                                            <SelectItem key={m} value={m}>{m}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3">
                                            <div>
                                                <label className="text-xs font-medium">Dosage</label>
                                                <Input
                                                    value={rec.dosage?.value || ""}
                                                    onChange={(e) => updateRecommendation(stageIdx, recIdx, "dosage.value", e.target.value)}
                                                    placeholder="e.g., 2"
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium">Unit</label>
                                                <Input
                                                    value={rec.dosage?.unit || ""}
                                                    onChange={(e) => updateRecommendation(stageIdx, recIdx, "dosage.unit", e.target.value)}
                                                    placeholder="e.g., ml"
                                                    className="h-8 text-xs"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium">Per</label>
                                                <Input
                                                    value={rec.dosage?.per || ""}
                                                    onChange={(e) => updateRecommendation(stageIdx, recIdx, "dosage.per", e.target.value)}
                                                    placeholder="e.g., liter"
                                                    className="h-8 text-xs"
                                                />
                                            </div>
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
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Submit */}
                <Button type="submit" disabled={isPending}>
                    {isPending && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditMode ? "Update Spray Program" : "Create Spray Program"}
                </Button>
            </form>
        </Form>
    )
}
