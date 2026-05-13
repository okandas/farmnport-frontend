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
import { queryUsers } from "@/lib/query"
import { capitalizeFirstLetter } from "@/lib/utilities"

export interface ClientSelection {
  id: string
  name: string
}

interface ClientComboboxProps {
  value: string
  onChange: (selection: ClientSelection) => void
}

export function ClientCombobox({ value, onChange }: ClientComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["clients-search", search],
    queryFn: () => queryUsers({ search: search, p: 1 }),
  })

  const clients = data?.data?.data || []
  const selectedClient = clients.find((client: any) => client.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedClient
            ? capitalizeFirstLetter(selectedClient.name)
            : "Select client..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder="Search client..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandEmpty>
            {isLoading ? "Loading..." : "No client found."}
          </CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {clients.map((client: any) => (
              <CommandItem
                key={client.id}
                value={client.id}
                onSelect={(currentValue) => {
                  if (currentValue !== value) {
                    onChange({ id: currentValue, name: client.name })
                  }
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === client.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {capitalizeFirstLetter(client.name)}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
