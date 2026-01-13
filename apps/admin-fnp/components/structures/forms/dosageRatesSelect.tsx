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
}

interface DosageRatesSelectProps {
    value: DosageRate[]
    onChange: (value: DosageRate[]) => void
}

export function DosageRatesSelect({ value = [], onChange }: DosageRatesSelectProps) {
    const [editingId, setEditingId] = useState<string | null>(null)
    const [cropId, setCropId] = useState("")
    const [cropName, setCropName] = useState("")
    const [targetIds, setTargetIds] = useState<string[]>([])
    const [targetNames, setTargetNames] = useState<string[]>([])
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
        if (!cropId || !cropName || targetIds.length === 0 || !dosageValue || !interval) {
            return
        }

        const rateData: DosageRate = {
            id: editingId || Date.now().toString(),
            crop: cropName,
            crop_id: cropId,
            targets: targetNames.join(", "),
            target_ids: targetIds,
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
            phi,
            remarks: remarksList,
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
        console.log("Rate remarks:", rate.remarks)
        console.log("Rate remarks type:", typeof rate.remarks)
        console.log("Rate remarks is array:", Array.isArray(rate.remarks))

        setCropId(rate.crop_id)
        setCropName(rate.crop)
        setTargetIds(rate.target_ids)
        setTargetNames(rate.targets.split(", "))
        setDosageValue(rate.dosage.value)
        setDosageUnit(rate.dosage.unit)
        setDosagePer(rate.dosage.per)
        setMaxApplications(rate.max_applications.max.toString())
        setMaxApplicationsNote(rate.max_applications.note || "")
        setInterval(rate.application_interval)
        setPhi(rate.phi || "")

        // Ensure remarks is an array
        const remarksArray = Array.isArray(rate.remarks) ? rate.remarks : []
        console.log("Setting remarksList to:", remarksArray)
        setRemarksList(remarksArray)
        setEditingId(rate.id)
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
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {rate.crop}
                                    </span>
                                    <span className="text-gray-500">•</span>
                                    <span className="text-gray-700 dark:text-gray-300">
                                        {rate.dosage.value} {rate.dosage.unit}/{rate.dosage.per}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Targets: {rate.targets}
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Max: {rate.max_applications.max} applications • Interval: {rate.application_interval}
                                    {rate.phi && ` • PHI: ${rate.phi}`}
                                </div>
                                {rate.max_applications.note && (
                                    <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                                        Note: {rate.max_applications.note}
                                    </div>
                                )}
                                {rate.remarks.length > 0 && (
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Remarks: {rate.remarks.join(", ")}
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

                <div>
                    <Label>Dosage</Label>
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
                                <SelectItem value="L">L</SelectItem>
                                <SelectItem value="mL">mL</SelectItem>
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
                    <p className="text-xs text-gray-500 mt-1">Value • Unit • Per (e.g., 0.6 kg/hectare)</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Max Applications</Label>
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
                        <Label>Interval</Label>
                        <Input
                            placeholder="e.g., 7 - 14 days"
                            value={interval}
                            onChange={(e) => setInterval(e.target.value)}
                            className="mt-2"
                        />
                    </div>
                </div>

                <div>
                    <Label>Max Applications Note (optional)</Label>
                    <Input
                        placeholder="e.g., Where a drench application has been used only two foliar applications"
                        value={maxApplicationsNote}
                        onChange={(e) => setMaxApplicationsNote(e.target.value)}
                        className="mt-2"
                    />
                </div>

                <div>
                    <Label>PHI - Pre-harvest Interval (optional)</Label>
                    <Input
                        placeholder="e.g., 3 days"
                        value={phi}
                        onChange={(e) => setPhi(e.target.value)}
                        className="mt-2"
                    />
                </div>

                <div>
                    <Label>Remarks (optional)</Label>
                    <div className="space-y-2">
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
                        disabled={!cropId || targetIds.length === 0 || !dosageValue || !interval}
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
