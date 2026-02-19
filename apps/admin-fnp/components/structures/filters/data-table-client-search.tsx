"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { useDebounce } from "use-debounce"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { queryUsers } from "@/lib/query"
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

interface DataTableClientSearchProps {
  selectedClientId?: string
  onClientChange: (clientId: string) => void
}

export function DataTableClientSearch({
  selectedClientId,
  onClientChange,
}: DataTableClientSearchProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [debouncedSearch] = useDebounce(search, 500)

  const { data, isLoading } = useQuery({
    queryKey: ["client-search", { search: debouncedSearch }],
    queryFn: () => queryUsers({ search: debouncedSearch, p: 1 }),
    enabled: debouncedSearch.length >= 2 || open,
    refetchOnWindowFocus: false,
  })

  const clients = data?.data?.data || []
  const selectedClient = clients.find((c: any) => c.id === selectedClientId)

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[200px] justify-between"
          >
            {selectedClient
              ? selectedClient.name
              : "Select client..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput
              placeholder="Search clients..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandEmpty>
              {isLoading ? "Loading..." : "No client found."}
            </CommandEmpty>
            <CommandGroup className="max-h-[200px] overflow-auto">
              {clients.map((client: any) => (
                <CommandItem
                  key={client.id}
                  value={client.id}
                  onSelect={() => {
                    onClientChange(client.id === selectedClientId ? "" : client.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedClientId === client.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {client.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedClientId && (
        <Button
          variant="ghost"
          onClick={() => onClientChange("")}
          className="h-8 px-2 lg:px-3"
        >
          Clear
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
