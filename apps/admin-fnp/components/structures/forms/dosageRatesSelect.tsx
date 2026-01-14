"use client"

import { useState, useRef, useEffect } from "react"
import { X, Check, ChevronsUpDown, Pencil } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { useDebounce } from "use-debounce"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utilities"
import { queryFarmProduce, queryAgroChemicalTargets } from "@/lib/query"
import { FarmProduce, AgroChemicalTarget } from "@/lib/schemas"
import { handleFetchError } from "@/lib/error-handler"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export interface DosageRate {
    id: string
    crop: string
    crop_id: string
    targets: string
    target_ids: string[]
    entries: Array<{
        dosage: {
            value: string
            unit: string
            per: string
        }
        max_applications: {
            max: number
            note: string
        }
        application_interval: string
        phi: string
        remarks: string[]
    }>
}

interface DosageRatesSelectProps {
    value: DosageRate[]
    onChange: (value: DosageRate[]) => void
}

export function DosageRatesSelect({ value = [], onChange }: DosageRatesSelectProps) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editingEntryIndex, setEditingEntryIndex] = useState<number | null>(null)
    const [cropId, setCropId] = useState("")
    const [cropName, setCropName] = useState("")
    const [targetIds, setTargetIds] = useState<string[]>([])
    const [targetNames, setTargetNames] = useState<string[]>([])

    // Entry fields (dosage + max apps + interval + phi + remarks as one combo)
    const [entriesList, setEntriesList] = useState<Array<{
        dosage: { value: string; unit: string; per: string }
        max_applications: { max: number; note: string }
        application_interval: string
        phi: string
        remarks: string[]
    }>>([])

    // Temporary fields for building an entry
    const [dosageValue, setDosageValue] = useState("")
    const [dosageUnit, setDosageUnit] = useState("kg")
    const [dosagePer, setDosagePer] = useState("hectare")
    const [maxApplications, setMaxApplications] = useState("1")
    const [maxApplicationsNote, setMaxApplicationsNote] = useState("")
    const [interval, setInterval] = useState("")
    const [phi, setPhi] = useState("")
    const [remarkInput, setRemarkInput] = useState("")
    const [remarksList, setRemarksList] = useState<string[]>([])

    const [openCrop, setOpenCrop] = useState(false)
    const [openTargets, setOpenTargets] = useState(false)
    const [searchCrop, setSearchCrop] = useState("")
    const [searchTarget, setSearchTarget] = useState("")

    // Debounce search queries
    const [debouncedCropQuery] = useDebounce(searchCrop, 1000)
    const [debouncedTargetQuery] = useDebounce(searchTarget, 1000)

    // Fetch farm produce
    const {
        data: cropData,
        isError: isCropError,
        error: cropError,
        refetch: refetchCrops,
    } = useQuery({
        queryKey: ["farm-produce", { search: debouncedCropQuery }],
        queryFn: () => queryFarmProduce({ search: debouncedCropQuery }),
        enabled: !!debouncedCropQuery,
    })

    const crops = cropData?.data?.data as FarmProduce[]

    // Fetch targets
    const {
        data: targetData,
        isError: isTargetError,
        error: targetError,
        refetch: refetchTargets,
    } = useQuery({
        queryKey: ["agrochemical-targets", { search: debouncedTargetQuery }],
        queryFn: () => queryAgroChemicalTargets({ search: debouncedTargetQuery }),
        enabled: !!debouncedTargetQuery,
    })

    const targets = targetData?.data?.data as AgroChemicalTarget[]

    // Handle crop fetch error
    const hasShownCropError = useRef(false)
    useEffect(() => {
        if (isCropError && !hasShownCropError.current) {
            hasShownCropError.current = true
            setOpenCrop(false)
            handleFetchError(cropError, {
                onRetry: () => {
                    hasShownCropError.current = false
                    refetchCrops()
                },
                context: "crops",
            })
        }
        if (!isCropError) {
            hasShownCropError.current = false
        }
    }, [isCropError, cropError, refetchCrops])

    // Handle target fetch error
    const hasShownTargetError = useRef(false)
    useEffect(() => {
        if (isTargetError && !hasShownTargetError.current) {
            hasShownTargetError.current = true
            setOpenTargets(false)
            handleFetchError(targetError, {
                onRetry: () => {
                    hasShownTargetError.current = false
                    refetchTargets()
                },
                context: "targets",
            })
        }
        if (!isTargetError) {
            hasShownTargetError.current = false
        }
    }, [isTargetError, targetError, refetchTargets])

    const handleAdd = () => {
        if (!cropId || !cropName || targetIds.length === 0 || entriesList.length === 0) {
            return
        }

        const rateData: DosageRate = {
            id: editingId || Date.now().toString(),
            crop: cropName,
            crop_id: cropId,
            targets: targetNames.join(", "),
            target_ids: targetIds,
            entries: entriesList,
        }

        if (editingId) {
            // Update existing rate
            onChange(value.map(rate => rate.id === editingId ? rateData : rate))
        } else {
            // Add new rate
            onChange([...value, rateData])
        }

        // Reset form
        resetForm()
    }

    const resetForm = () => {
        setCropId("")
        setCropName("")
        setTargetIds([])
        setTargetNames([])
        setEntriesList([])
        setDosageValue("")
        setDosageUnit("kg")
        setDosagePer("hectare")
        setMaxApplications("1")
        setMaxApplicationsNote("")
        setInterval("")
        setPhi("")
        setRemarkInput("")
        setRemarksList([])
        setEditingId(null)
    }

    const handleEdit = (rate: DosageRate) => {
        console.log("Editing rate:", rate)

        setCropId(rate.crop_id)
        setCropName(rate.crop)
        setTargetIds(rate.target_ids)
        setTargetNames(rate.targets.split(", "))

        // Load entries
        const entriesArray = Array.isArray(rate.entries) ? rate.entries : []
        setEntriesList(entriesArray)

        setEditingId(rate.id)
    }

    const handleAddEntry = () => {
        if (!dosageValue.trim() || !interval.trim()) {
            return
        }

        // If editing an entry, use handleUpdateEntry instead
        if (editingEntryIndex !== null) {
            handleUpdateEntry()
            return
        }

        const newEntry = {
            dosage: {
                value: dosageValue,
                unit: dosageUnit,
                per: dosagePer,
            },
            max_applications: {
                max: parseInt(maxApplications) || 1,
                note: maxApplicationsNote,
            },
            application_interval: interval,
            phi: phi,
            remarks: remarksList,
        }

        setEntriesList([...entriesList, newEntry])

        // Reset entry form fields
        resetEntryForm()
    }

    const handleRemoveEntry = (index: number) => {
        setEntriesList(entriesList.filter((_, i) => i !== index))
        if (editingEntryIndex === index) {
            setEditingEntryIndex(null)
            resetEntryForm()
        }
    }

    const handleEditEntry = (index: number) => {
        const entry = entriesList[index]
        setDosageValue(entry.dosage.value)
        setDosageUnit(entry.dosage.unit)
        setDosagePer(entry.dosage.per)
        setMaxApplications(entry.max_applications.max.toString())
        setMaxApplicationsNote(entry.max_applications.note)
        setInterval(entry.application_interval)
        setPhi(entry.phi)
        setRemarksList(entry.remarks)
        setEditingEntryIndex(index)
    }

    const handleUpdateEntry = () => {
        if (editingEntryIndex === null || !dosageValue.trim() || !interval.trim()) {
            return
        }

        const updatedEntry = {
            dosage: {
                value: dosageValue,
                unit: dosageUnit,
                per: dosagePer,
            },
            max_applications: {
                max: parseInt(maxApplications) || 1,
                note: maxApplicationsNote,
            },
            application_interval: interval,
            phi: phi,
            remarks: remarksList,
        }

        const newEntriesList = [...entriesList]
        newEntriesList[editingEntryIndex] = updatedEntry
        setEntriesList(newEntriesList)
        setEditingEntryIndex(null)
        resetEntryForm()
    }

    const resetEntryForm = () => {
        setDosageValue("")
        setDosageUnit("kg")
        setDosagePer("hectare")
        setMaxApplications("1")
        setMaxApplicationsNote("")
        setInterval("")
        setPhi("")
        setRemarkInput("")
        setRemarksList([])
    }

    const handleAddRemark = () => {
        if (remarkInput.trim()) {
            setRemarksList([...remarksList, remarkInput.trim()])
            setRemarkInput("")
        }
    }

    const handleRemoveRemark = (index: number) => {
        setRemarksList(remarksList.filter((_, i) => i !== index))
    }

    const handleRemove = (id: string) => {
        onChange(value.filter(rate => rate.id !== id))
    }

    const handleToggleTarget = (targetId: string, targetName: string, scientificName?: string) => {
        const displayName = scientificName ? `${targetName} (${scientificName})` : targetName

        if (targetIds.includes(targetId)) {
            const index = targetIds.indexOf(targetId)
            setTargetIds(targetIds.filter(id => id !== targetId))
            setTargetNames(targetNames.filter((_, i) => i !== index))
        } else {
            setTargetIds([...targetIds, targetId])
            setTargetNames([...targetNames, displayName])
        }
    }

    return (
        <div className="space-y-6">
            {/* Display existing rates */}
            {value.length > 0 && (
                <div className="space-y-3">
                    {value.map((rate) => (
                        <div
                            key={rate.id}
                            className="flex items-start justify-between rounded-md border border-gray-300 bg-gray-50 p-3 dark:border-white/10 dark:bg-gray-900"
                        >
                            <div className="flex-1 space-y-2">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white text-base">
                                            {rate.crop}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            <span className="font-medium">Targets:</span> {rate.targets}
                                        </div>
                                    </div>
                                </div>

                                {rate.entries && rate.entries.length > 0 && (
                                    <div className="mt-3 space-y-3">
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                            Dosage Entries ({rate.entries.length})
                                        </div>
                                        {rate.entries.map((entry, i) => (
                                            <div
                                                key={i}
                                                className="pl-4 border-l-4 border-indigo-400 dark:border-indigo-600 bg-white dark:bg-gray-800 p-3 rounded-r space-y-2"
                                            >
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Dosage</div>
                                                        <div className="text-sm text-gray-900 dark:text-white font-semibold">
                                                            {entry.dosage.value} {entry.dosage.unit}/{entry.dosage.per}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Max Applications</div>
                                                        <div className="text-sm text-gray-900 dark:text-white">
                                                            {entry.max_applications.max} times
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Application Interval</div>
                                                        <div className="text-sm text-gray-900 dark:text-white">
                                                            {entry.application_interval}
                                                        </div>
                                                    </div>
                                                    {entry.phi && (
                                                        <div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">PHI (Pre-Harvest Interval)</div>
                                                            <div className="text-sm text-gray-900 dark:text-white">
                                                                {entry.phi}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {entry.max_applications.note && (
                                                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Note</div>
                                                        <div className="text-sm text-gray-700 dark:text-gray-300 italic">
                                                            {entry.max_applications.note}
                                                        </div>
                                                    </div>
                                                )}

                                                {entry.remarks.length > 0 && (
                                                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">Remarks</div>
                                                        <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside space-y-1">
                                                            {entry.remarks.map((remark, idx) => (
                                                                <li key={idx}>{remark}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(rate)}
                                    className="ml-2"
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemove(rate.id)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add new rate form */}
            <div className="grid gap-4 px-1">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Crop</Label>
                        <Popover open={openCrop} onOpenChange={setOpenCrop}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "w-full justify-between mt-2",
                                        !cropId && "text-muted-foreground"
                                    )}
                                >
                                    {cropId ? cropName : "Select crop"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                <Command>
                                    <CommandInput
                                        placeholder="Search crop..."
                                        onValueChange={(value) => setSearchCrop(value)}
                                    />
                                    <CommandList>
                                        <CommandEmpty>
                                            {searchCrop.length < 2
                                                ? "Type at least 2 characters to search"
                                                : "No crop found."}
                                        </CommandEmpty>
                                        {crops?.map((crop) => (
                                            <CommandItem
                                                value={crop.name}
                                                key={crop.id}
                                                onSelect={() => {
                                                    setCropId(crop.id)
                                                    setCropName(crop.name)
                                                    setOpenCrop(false)
                                                }}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        crop.id === cropId ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                {crop.name}
                                            </CommandItem>
                                        ))}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div>
                        <Label>Targets (Pests/Diseases)</Label>
                        <Popover open={openTargets} onOpenChange={setOpenTargets}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                        "w-full justify-between mt-2",
                                        targetIds.length === 0 && "text-muted-foreground"
                                    )}
                                >
                                    {targetIds.length > 0
                                        ? `${targetIds.length} selected`
                                        : "Select targets"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                                <Command>
                                    <CommandInput
                                        placeholder="Search target..."
                                        onValueChange={(value) => setSearchTarget(value)}
                                    />
                                    <CommandList>
                                        <CommandEmpty>
                                            {searchTarget.length < 2
                                                ? "Type at least 2 characters to search"
                                                : "No target found."}
                                        </CommandEmpty>
                                        {/* Show selected targets first */}
                                        {targetIds.length > 0 && (
                                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 border-b">
                                                Selected ({targetIds.length}):
                                            </div>
                                        )}
                                        {targetIds.length > 0 && targetNames.map((name, idx) => (
                                            <div
                                                key={`selected-${targetIds[idx]}`}
                                                className="px-2 py-1.5 text-sm bg-blue-50 dark:bg-blue-900/20 border-b last:border-b-0 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                                onClick={() => {
                                                    const targetId = targetIds[idx]
                                                    setTargetIds(targetIds.filter(id => id !== targetId))
                                                    setTargetNames(targetNames.filter((_, i) => i !== idx))
                                                }}
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2">
                                                        <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                        <span className="text-gray-700 dark:text-gray-300">{name}</span>
                                                    </div>
                                                    <X className="h-3 w-3 text-gray-500 hover:text-red-600" />
                                                </div>
                                            </div>
                                        ))}
                                        {targetIds.length > 0 && targets && targets.length > 0 && (
                                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 border-b">
                                                Available:
                                            </div>
                                        )}
                                        {targets?.map((target) => (
                                            <CommandItem
                                                value={target.name}
                                                key={target.id}
                                                onSelect={() => handleToggleTarget(target.id, target.name, target.scientific_name)}
                                            >
                                                <Check
                                                    className={cn(
                                                        "mr-2 h-4 w-4",
                                                        targetIds.includes(target.id) ? "opacity-100" : "opacity-0"
                                                    )}
                                                />
                                                <div className="flex flex-col">
                                                    <span>{target.name}</span>
                                                    {target.scientific_name && (
                                                        <span className="text-xs text-gray-500 italic">
                                                            {target.scientific_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Display added entries */}
                {entriesList.length > 0 && (
                    <div>
                        <Label>Dosage Entries ({entriesList.length})</Label>
                        <div className="space-y-2 mt-2">
                            {entriesList.map((entry, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex items-start justify-between rounded-md border p-3",
                                        editingEntryIndex === index
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                            : "border-gray-300 bg-gray-50 dark:border-white/10 dark:bg-gray-900"
                                    )}
                                >
                                    <div className="flex-1 space-y-1">
                                        <div className="text-sm text-gray-700 dark:text-gray-300">
                                            <span className="font-medium">Dosage:</span> {entry.dosage.value} {entry.dosage.unit}/{entry.dosage.per}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            Max: {entry.max_applications.max} • Interval: {entry.application_interval}
                                            {entry.phi && ` • PHI: ${entry.phi}`}
                                        </div>
                                        {entry.max_applications.note && (
                                            <div className="text-xs text-gray-600 dark:text-gray-400 italic">
                                                Note: {entry.max_applications.note}
                                            </div>
                                        )}
                                        {entry.remarks.length > 0 && (
                                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                                Remarks: {entry.remarks.join(", ")}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleEditEntry(index)}
                                            disabled={editingEntryIndex !== null && editingEntryIndex !== index}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveEntry(index)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add new entry form */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <Label className="text-base">Add Dosage Entry</Label>
                    <div className="mt-4 space-y-4">
                        <div>
                            <Label className="text-sm">Dosage</Label>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                <Input
                                    placeholder="0.6"
                                    value={dosageValue}
                                    onChange={(e) => setDosageValue(e.target.value)}
                                />
                                <Select value={dosageUnit} onValueChange={setDosageUnit}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Unit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="kg">kg</SelectItem>
                                        <SelectItem value="g">g</SelectItem>
                                        <SelectItem value="l">l</SelectItem>
                                        <SelectItem value="ml">ml</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={dosagePer} onValueChange={setDosagePer}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Per" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="hectare">hectare</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-sm">Max Applications</Label>
                                <Input
                                    type="number"
                                    min="1"
                                    placeholder="3"
                                    value={maxApplications}
                                    onChange={(e) => setMaxApplications(e.target.value)}
                                    className="mt-2"
                                />
                            </div>
                            <div>
                                <Label className="text-sm">Interval</Label>
                                <Input
                                    placeholder="e.g., 7 - 14 days"
                                    value={interval}
                                    onChange={(e) => setInterval(e.target.value)}
                                    className="mt-2"
                                />
                            </div>
                        </div>

                        <div>
                            <Label className="text-sm">Max Applications Note (optional)</Label>
                            <Input
                                placeholder="e.g., Where a drench application has been used only two foliar applications"
                                value={maxApplicationsNote}
                                onChange={(e) => setMaxApplicationsNote(e.target.value)}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label className="text-sm">PHI - Pre-harvest Interval (optional)</Label>
                            <Input
                                placeholder="e.g., 3 days"
                                value={phi}
                                onChange={(e) => setPhi(e.target.value)}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label className="text-sm">Remarks (optional)</Label>
                            <div className="space-y-2 mt-2">
                                {remarksList.length > 0 && (
                                    <div className="space-y-1">
                                        {remarksList.map((remark, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-md border border-gray-300 bg-gray-50 px-3 py-1.5 text-sm dark:border-white/10 dark:bg-gray-900"
                                            >
                                                <span className="text-gray-700 dark:text-gray-300">{remark}</span>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveRemark(index)}
                                                    className="h-6 w-6 p-0"
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="e.g., Foliar application"
                                        value={remarkInput}
                                        onChange={(e) => setRemarkInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault()
                                                handleAddRemark()
                                            }
                                        }}
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleAddRemark}
                                        disabled={!remarkInput.trim()}
                                    >
                                        Add
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {editingEntryIndex !== null && (
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setEditingEntryIndex(null)
                                        resetEntryForm()
                                    }}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            )}
                            <Button
                                type="button"
                                onClick={handleAddEntry}
                                disabled={!dosageValue.trim() || !interval.trim()}
                                variant="secondary"
                                className={editingEntryIndex !== null ? "flex-1" : "w-full"}
                            >
                                {editingEntryIndex !== null ? "Update Entry" : "Add Entry"}
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2">
                    {editingId && (
                        <Button
                            type="button"
                            onClick={resetForm}
                            variant="outline"
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        type="button"
                        onClick={handleAdd}
                        disabled={!cropId || targetIds.length === 0 || entriesList.length === 0}
                        variant="outline"
                        className={editingId ? "flex-1" : "w-full"}
                    >
                        {editingId ? "Update Dosage Rate" : "Add Dosage Rate"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
