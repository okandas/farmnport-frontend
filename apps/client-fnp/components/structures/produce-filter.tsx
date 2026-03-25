"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"

interface ProduceFilterProps {
  categories: { name: string; slug: string }[]
  activeFilter: string
}

export function ProduceFilter({ categories, activeFilter }: ProduceFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleFilter(slug: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (slug === activeFilter) {
      params.delete("filter")
    } else {
      params.set("filter", slug)
    }
    const qs = params.toString()
    router.push(`/prices/produce${qs ? `?${qs}` : ""}`)
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={!activeFilter ? "default" : "outline"}
        size="sm"
        onClick={() => {
          router.push("/prices/produce")
        }}
      >
        All
      </Button>
      {categories.map((cat) => (
        <Button
          key={cat.slug}
          variant={activeFilter === cat.slug ? "default" : "outline"}
          size="sm"
          onClick={() => handleFilter(cat.slug)}
        >
          {cat.name}
        </Button>
      ))}
    </div>
  )
}
