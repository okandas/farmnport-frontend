"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { queryAllFarmProduceUnpaginated } from "@/lib/query"

export const GOODS_UNITS = ["units", "kg", "tonne", "crates", "bags", "litres", "dozens"]

export type GoodsItem = {
  produce_id: string
  produce_name: string
  produce_slug: string
  quantity: number
  unit: string
  other: boolean
}

export const EMPTY_GOODS_ITEM = (): GoodsItem => ({
  produce_id: "",
  produce_name: "",
  produce_slug: "",
  quantity: 0,
  unit: "units",
  other: false,
})

const inputCls = "flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"

function ProduceCombobox({
  value,
  onSelect,
  produce,
}: {
  value: string
  onSelect: (id: string, name: string, slug: string) => void
  produce: any[]
}) {
  const [open, setOpen] = useState(false)
  const selected = produce.find((p: any) => p.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={`${inputCls} w-full justify-between text-left ${!selected ? "text-muted-foreground" : ""}`}
        >
          {selected ? selected.name : "Search produce..."}
        </button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start" style={{ width: "var(--radix-popover-trigger-width)" }}>
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No produce found.</CommandEmpty>
            <CommandGroup>
              {produce.map((p: any) => (
                <CommandItem
                  key={p.id}
                  value={p.name}
                  onSelect={() => {
                    onSelect(p.id, p.name, p.slug)
                    setOpen(false)
                  }}
                >
                  {p.name}
                </CommandItem>
              ))}
              <CommandItem
                value="__other__"
                onSelect={() => {
                  onSelect("__other__", "", "")
                  setOpen(false)
                }}
              >
                Other (not listed)
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function GoodsPicker({
  items,
  onChange,
}: {
  items: GoodsItem[]
  onChange: (items: GoodsItem[]) => void
}) {
  const { data } = useQuery({
    queryKey: ["all-farm-produce"],
    queryFn: () => queryAllFarmProduceUnpaginated().then((r) => r.data),
    staleTime: 1000 * 60 * 10,
  })

  const produce: any[] = data?.produce ?? data?.data ?? []

  function update(i: number, patch: Partial<GoodsItem>) {
    const next = [...items]
    next[i] = { ...next[i], ...patch }
    onChange(next)
  }

  function remove(i: number) {
    onChange(items.filter((_, idx) => idx !== i))
  }

  function add() {
    onChange([...items, EMPTY_GOODS_ITEM()])
  }

  function selectProduce(i: number, id: string, name: string, slug: string) {
    if (id === "__other__") {
      update(i, { produce_id: "", produce_name: "", produce_slug: "", other: true })
    } else {
      update(i, { produce_id: id, produce_name: name, produce_slug: slug, other: false })
    }
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
          {/* Produce combobox or free-text name */}
          {item.other ? (
            <div className="flex gap-2 items-center">
              <input
                value={item.produce_name}
                onChange={(e) => update(i, { produce_name: e.target.value })}
                placeholder="Describe the item"
                className={`${inputCls} flex-1`}
              />
              <button
                type="button"
                onClick={() => update(i, { other: false, produce_name: "", produce_id: "", produce_slug: "" })}
                className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap"
              >
                Search catalogue
              </button>
            </div>
          ) : (
            <ProduceCombobox
              value={item.produce_id}
              produce={produce}
              onSelect={(id, name, slug) => selectProduce(i, id, name, slug)}
            />
          )}

          {/* Quantity */}
          <input
            type="number"
            min={0.1}
            step={0.1}
            value={item.quantity || ""}
            onChange={(e) => update(i, { quantity: parseFloat(e.target.value) || 0 })}
            placeholder="Qty"
            className={`${inputCls} w-20`}
          />

          {/* Unit */}
          <select
            value={item.unit}
            onChange={(e) => update(i, { unit: e.target.value })}
            className={`${inputCls} w-28`}
          >
            {GOODS_UNITS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>

          {/* Remove */}
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-xs text-muted-foreground hover:text-destructive px-1"
            >
              Remove
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="text-xs text-primary hover:underline"
      >
        Add item
      </button>
    </div>
  )
}
