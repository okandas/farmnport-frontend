"use client"

import { useState, useRef, useEffect } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utilities"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface SearchSelectProps {
    queryKey: string | (string | undefined)[]
    queryFn: (params: { p: number; search: string }) => Promise<any>
    getItems: (page: any) => any[]
    value: string
    onValueChange: (value: string) => void
    getLabel: (item: any) => string
    getValue: (item: any) => string
    placeholder?: string
    searchPlaceholder?: string
    disabled?: boolean
    className?: string
}

export function SearchSelect({
    queryKey,
    queryFn,
    getItems,
    value,
    onValueChange,
    getLabel,
    getValue,
    placeholder = "Select...",
    searchPlaceholder = "Search...",
    disabled = false,
    className,
}: SearchSelectProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")
    const [debouncedSearch, setDebouncedSearch] = useState("")
    const sentinelRef = useRef<HTMLDivElement>(null)

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
    const selectedLabel = selectedItem ? getLabel(selectedItem) : value ? `ID: ${value.slice(-6)}` : ""

    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel || !open) return
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage()
                }
            },
            { threshold: 0.1 }
        )
        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [hasNextPage, isFetchingNextPage, fetchNextPage, open, items.length])

    return (
        <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSearch("") }}>
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
                    <span className="truncate">{selectedLabel || placeholder}</span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList className="max-h-56 overflow-y-auto">
                        {!isLoading && items.length === 0 && (
                            <CommandEmpty>No results found.</CommandEmpty>
                        )}
                        {items.map((item) => (
                            <CommandItem
                                key={getValue(item)}
                                value={getValue(item)}
                                onSelect={() => {
                                    onValueChange(getValue(item))
                                    setOpen(false)
                                    setSearch("")
                                }}
                            >
                                <Check className={cn("mr-2 h-4 w-4 shrink-0", getValue(item) === value ? "opacity-100" : "opacity-0")} />
                                {getLabel(item)}
                            </CommandItem>
                        ))}
                        <div ref={sentinelRef} className="px-3 py-1.5 text-center text-xs text-gray-400">
                            {isFetchingNextPage && "Loading more..."}
                        </div>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
