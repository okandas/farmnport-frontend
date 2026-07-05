"use client"

import { useState, useRef, useEffect } from "react"
import { useInfiniteQuery, useQuery } from "@tanstack/react-query"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utilities"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface SearchSelectProps {
    queryKey: string | (string | undefined)[]
    queryFn: (params: { p: number; search: string }) => Promise<any>
    fetchById?: (id: string) => Promise<any>
    getItems: (page: any) => any[]
    value: string
    onValueChange: (value: string) => void
    onItemSelect?: (item: any) => void
    getLabel: (item: any) => string
    getValue: (item: any) => string
    placeholder?: string
    searchPlaceholder?: string
    disabled?: boolean
    clearable?: boolean
    capitalize?: boolean
    className?: string
    valueLabel?: string
}

export function SearchSelect({
    queryKey,
    queryFn,
    fetchById,
    getItems,
    value,
    onValueChange,
    getLabel,
    getValue,
    placeholder = "Select...",
    searchPlaceholder = "Search...",
    disabled = false,
    clearable = false,
    capitalize = false,
    onItemSelect,
    className,
    valueLabel,
}: SearchSelectProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const listRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300)
        return () => clearTimeout(t)
    }, [search])

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
        queryKey: [...(Array.isArray(queryKey) ? queryKey : [queryKey]), debouncedSearch],
        queryFn: ({ pageParam }) => queryFn({ p: pageParam as number, search: debouncedSearch }),
        initialPageParam: 1,
        getNextPageParam: (lastPage: any, allPages: any[]) => {
            const total = lastPage?.data?.total || 0
            const loaded = allPages.flatMap((p) => getItems(p)).length
            return loaded < total ? allPages.length + 1 : undefined
        },
        staleTime: 1000 * 60 * 5,
    })

    const items = data?.pages.flatMap((p) => getItems(p)) ?? []
    const selectedItem = items.find((item) => getValue(item) === value)

    // Fetch the selected item by ID if it's not in the paginated list
    const { data: fetchedItem } = useQuery({
        queryKey: [...(Array.isArray(queryKey) ? queryKey : [queryKey]), "by-id", value],
        queryFn: () => fetchById!(value),
        enabled: !!value && !selectedItem && !!fetchById,
        staleTime: 1000 * 60 * 10,
    })

    const resolvedItem = selectedItem || (fetchedItem?.data ?? fetchedItem) || null
    const selectedLabel = resolvedItem ? getLabel(resolvedItem) : (valueLabel || "")

    function handleScroll() {
        const el = listRef.current
        if (!el || !hasNextPage || isFetchingNextPage) return
        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
            fetchNextPage()
        }
    }

    return (
        <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setSearch("") }}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    disabled={disabled}
                    className={cn(
                        "w-full justify-between font-normal text-sm bg-white dark:bg-white/5 border-gray-300 dark:border-white/10",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    <span className={cn("truncate", capitalize && "capitalize")}>{selectedLabel || placeholder}</span>
                    <span className="ml-2 flex items-center gap-1 shrink-0">
                        {clearable && value && (
                            <span
                                role="button"
                                onClick={(e) => { e.stopPropagation(); onValueChange(""); setSearch("") }}
                                className="rounded-full p-0.5 hover:bg-gray-200 dark:hover:bg-white/20 text-muted-foreground"
                            >
                                <X className="h-3 w-3" />
                            </span>
                        )}
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList ref={listRef} className="max-h-56 overflow-y-auto" onScroll={handleScroll}>
                        {!isLoading && items.length === 0 && (
                            <CommandEmpty>No results found.</CommandEmpty>
                        )}
                        {items.map((item) => (
                            <CommandItem
                                key={getValue(item)}
                                value={getValue(item)}
                                onSelect={() => {
                                    onValueChange(getValue(item))
                                    onItemSelect?.(item)
                                    setOpen(false)
                                    setSearch("")
                                }}
                                className={capitalize ? "capitalize" : undefined}
                            >
                                <Check className={cn("mr-2 h-4 w-4 shrink-0", getValue(item) === value ? "opacity-100" : "opacity-0")} />
                                {getLabel(item)}
                            </CommandItem>
                        ))}
                        <div className="px-3 py-1.5 text-center text-xs text-gray-400">
                            {isFetchingNextPage && "Loading more..."}
                        </div>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
