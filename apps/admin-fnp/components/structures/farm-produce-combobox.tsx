"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { useQuery } from "@tanstack/react-query"

import { cn } from "@/lib/utilities"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { queryFarmProduceCategories, queryFarmProduceByCategory } from "@/lib/query"

// ── Category combobox ─────────────────────────────────────────────────────────

interface FarmProduceCategoryComboboxProps {
  value: string  // category slug
  onChange: (slug: string, name: string) => void
}

export function FarmProduceCategoryCombobox({ value, onChange }: FarmProduceCategoryComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["farm-produce-categories"],
    queryFn: () => queryFarmProduceCategories(),
  })

  const categories: any[] = data?.data?.data ?? []
  const filtered = search
    ? categories.filter((c: any) => c.name.toLowerCase().includes(search.toLowerCase()))
    : categories
  const selected = categories.find((c: any) => c.slug === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected ? selected.name : "Select category..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search category..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>{isLoading ? "Loading..." : "No category found."}</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {filtered.map((c: any) => (
              <CommandItem
                key={c.slug}
                value={c.slug}
                onSelect={() => {
                  onChange(c.slug, c.name)
                  setOpen(false)
                  setSearch("")
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", value === c.slug ? "opacity-100" : "opacity-0")} />
                {c.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// ── Product combobox ──────────────────────────────────────────────────────────

export interface FarmProduceSelection {
  id: string
  name: string
  slug: string
}

interface FarmProduceComboboxProps {
  categorySlug: string
  value: string  // product id
  onChange: (selection: FarmProduceSelection) => void
}

export function FarmProduceCombobox({ categorySlug, value, onChange }: FarmProduceComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["farm-produce-by-category", categorySlug],
    queryFn: () => queryFarmProduceByCategory(categorySlug),
    enabled: !!categorySlug,
  })

  const items: any[] = data?.data?.data ?? []
  const filtered = search
    ? items.filter((p: any) => p.name.toLowerCase().includes(search.toLowerCase()))
    : items
  const selected = items.find((p: any) => p.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={!categorySlug}
          className="w-full justify-between"
        >
          {selected ? selected.name : "Select product..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search product..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>{isLoading ? "Loading..." : "No product found."}</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {filtered.map((p: any) => (
              <CommandItem
                key={p.id}
                value={p.id}
                onSelect={() => {
                  onChange({ id: p.id, name: p.name, slug: p.slug })
                  setOpen(false)
                  setSearch("")
                }}
              >
                <Check className={cn("mr-2 h-4 w-4", value === p.id ? "opacity-100" : "opacity-0")} />
                {p.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
