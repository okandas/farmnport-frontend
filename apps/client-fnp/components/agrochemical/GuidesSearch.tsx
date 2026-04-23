"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function GuidesSearch() {
    const router = useRouter()
    const [query, setQuery] = useState("")

    const handleSearch = () => {
        if (query.trim().length >= 2) {
            router.push(`/agrochemical-guides?search=${encodeURIComponent(query.trim())}`)
        } else {
            router.push("/agrochemical-guides")
        }
    }

    return (
        <div className="flex items-center gap-2 w-full max-w-lg mx-auto">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search products, active ingredients..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 h-11"
                />
            </div>
            <Button onClick={handleSearch} size="default" className="h-11 px-5">
                Search
            </Button>
        </div>
    )
}
