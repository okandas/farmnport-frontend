"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { useDebounce } from "use-debounce"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { queryAgroChemicalActiveIngredients } from "@/lib/query"
import { AgroChemicalActiveIngredient } from "@/lib/schemas"
import { cn } from "@/lib/utilities"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface SelectedIngredient {
    id: string
    name: string
    dosage_value: number
    dosage_unit: string
}

interface ActiveIngredientsSelectProps {
    value: SelectedIngredient[]
    onChange: (value: SelectedIngredient[]) => void
}

export function ActiveIngredientsSelect({ value = [], onChange }: ActiveIngredientsSelectProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [open, setOpen] = useState(false)

    // Debounce search query
    const [debouncedSearch] = useDebounce(searchTerm, 500)
    const enabled = !!debouncedSearch && debouncedSearch.length >= 2

    const { data, isError, refetch, error } = useQuery({
        queryKey: ["dashboard-agrochemical-active-ingredients-search", { search: debouncedSearch }],
        queryFn: () =>
            queryAgroChemicalActiveIngredients({
                search: debouncedSearch,
            }),
        enabled,
    })

    const ingredients = data?.data?.data as AgroChemicalActiveIngredient[]

    // Show error toast only once when error occurs
    const hasShownError = useRef(false)
    useEffect(() => {
        if (isError && !hasShownError.current) {
            hasShownError.current = true
            setOpen(false)
            handleFetchError(error, {
                onRetry: () => {
                    hasShownError.current = false
                    refetch()
                },
                context: "active ingredients"
            })
        }
        if (!isError) {
            hasShownError.current = false
        }
    }, [isError, error, refetch])

    const handleSelectIngredient = (ingredient: AgroChemicalActiveIngredient) => {
        // Check if already selected
        if (value.some(item => item.id === ingredient.id)) {
            return
        }

        // Add new ingredient with default values
        const newIngredient: SelectedIngredient = {
            id: ingredient.id,
            name: ingredient.name,
            dosage_value: 0,
            dosage_unit: "g/kg",
        }

        onChange([...value, newIngredient])
        setOpen(false)
        setSearchTerm("")
    }

    const handleRemoveIngredient = (id: string) => {
        onChange(value.filter(item => item.id !== id))
    }

    const handleDosageChange = (id: string, dosage_value: number) => {
        onChange(
            value.map(item =>
                item.id === id ? { ...item, dosage_value } : item
            )
        )
    }

    const handleUnitChange = (id: string, dosage_unit: string) => {
        onChange(
            value.map(item =>
                item.id === id ? { ...item, dosage_unit } : item
            )
        )
    }

    return (
        <div className="space-y-4">
            <div>
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            className="w-full justify-between sm:max-w-md"
                        >
                            Select active ingredients
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                        <Command>
                            <CommandInput
                                placeholder="Search active ingredient..."
                                onValueChange={(val) => {
                                    setSearchTerm(val)
                                }}
                                value={searchTerm}
                            />
                            <CommandList>
                                <CommandEmpty>
                                    {searchTerm.length < 2
                                        ? "Type at least 2 characters to search"
                                        : "No active ingredient found."}
                                </CommandEmpty>
                                {ingredients?.map((ingredient) => (
                                    <CommandItem
                                        value={ingredient.name}
                                        key={ingredient.id}
                                        onSelect={() => {
                                            handleSelectIngredient(ingredient)
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value.some(item => item.id === ingredient.id)
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        {ingredient.name}
                                    </CommandItem>
                                ))}
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {value.length > 0 && (
                <div className="space-y-3">
                    {value.map((ingredient) => (
                        <div
                            key={ingredient.id}
                            className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg bg-white dark:border-gray-700 dark:bg-gray-800"
                        >
                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="sm:col-span-1">
                                    <Label className="text-sm font-medium text-gray-900 dark:text-white">
                                        Ingredient
                                    </Label>
                                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                        {ingredient.name}
                                    </p>
                                </div>
                                <div>
                                    <Label htmlFor={`dosage-${ingredient.id}`} className="text-sm font-medium text-gray-900 dark:text-white">
                                        Dosage Value
                                    </Label>
                                    <Input
                                        id={`dosage-${ingredient.id}`}
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={ingredient.dosage_value || ""}
                                        onChange={(e) =>
                                            handleDosageChange(
                                                ingredient.id,
                                                parseFloat(e.target.value) || 0
                                            )
                                        }
                                        className="mt-1"
                                        placeholder="e.g., 100"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor={`unit-${ingredient.id}`} className="text-sm font-medium text-gray-900 dark:text-white">
                                        Unit
                                    </Label>
                                    <Input
                                        id={`unit-${ingredient.id}`}
                                        type="text"
                                        value={ingredient.dosage_unit}
                                        onChange={(e) =>
                                            handleUnitChange(ingredient.id, e.target.value)
                                        }
                                        className="mt-1"
                                        placeholder="e.g., g/kg, g/L"
                                    />
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveIngredient(ingredient.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
