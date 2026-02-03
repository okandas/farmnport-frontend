"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { queryAllAgroChemicals, queryAllBrands, queryAllTargets, queryAllActiveIngredients } from "@/lib/query"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Search, Filter, Bug, Beaker } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function AllAgroChemicalsPage() {
    const [selectedBrands, setSelectedBrands] = useState<string[]>([])
    const [selectedTargets, setSelectedTargets] = useState<string[]>([])
    const [selectedActiveIngredients, setSelectedActiveIngredients] = useState<string[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [page, setPage] = useState(1)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const { data: chemicalsData, isLoading: chemicalsLoading } = useQuery({
        queryKey: ["agrochemicals-all", page, selectedBrands, selectedTargets, selectedActiveIngredients],
        queryFn: () => queryAllAgroChemicals({
            p: page,
            brand: selectedBrands,
            target: selectedTargets,
            active_ingredient: selectedActiveIngredients,
        }),
        refetchOnWindowFocus: false,
    })

    const { data: brandsData } = useQuery({
        queryKey: ["brands-all"],
        queryFn: () => queryAllBrands(),
        refetchOnWindowFocus: false,
    })

    const { data: targetsData } = useQuery({
        queryKey: ["targets-all"],
        queryFn: () => queryAllTargets(),
        refetchOnWindowFocus: false,
    })

    const { data: activeIngredientsData } = useQuery({
        queryKey: ["active-ingredients-all"],
        queryFn: () => queryAllActiveIngredients(),
        refetchOnWindowFocus: false,
    })

    const chemicals = chemicalsData?.data?.data || []
    const brands = brandsData?.data?.data || []
    const targets = targetsData?.data?.data || []
    const activeIngredients = activeIngredientsData?.data?.data || []

    const handleBrandToggle = (brandId: string) => {
        setSelectedBrands(prev =>
            prev.includes(brandId) ? prev.filter(id => id !== brandId) : [...prev, brandId]
        )
        setPage(1)
    }

    const handleTargetToggle = (targetId: string) => {
        setSelectedTargets(prev =>
            prev.includes(targetId) ? prev.filter(id => id !== targetId) : [...prev, targetId]
        )
        setPage(1)
    }

    const handleActiveIngredientToggle = (aiId: string) => {
        setSelectedActiveIngredients(prev =>
            prev.includes(aiId) ? prev.filter(id => id !== aiId) : [...prev, aiId]
        )
        setPage(1)
    }

    const clearAllFilters = () => {
        setSelectedBrands([])
        setSelectedTargets([])
        setSelectedActiveIngredients([])
        setPage(1)
    }

    const activeFiltersCount = selectedBrands.length + selectedTargets.length + selectedActiveIngredients.length

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold tracking-tight font-heading mb-4">
                        All Agrochemicals
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Browse our complete collection of agrochemical products
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search agrochemicals..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-6"
                        />
                    </div>
                </div>

                {/* Mobile Filter Button */}
                <div className="lg:hidden mb-6">
                    <Button
                        variant="outline"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full"
                    >
                        <Filter className="h-4 w-4 mr-2" />
                        Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                    </Button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className={`lg:block ${sidebarOpen ? 'block' : 'hidden'} w-full lg:w-64 flex-shrink-0`}>
                        <div className="sticky top-6 space-y-6">
                            {/* Filter Header */}
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">Filters</h2>
                                {activeFiltersCount > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearAllFilters}
                                    >
                                        Clear all
                                    </Button>
                                )}
                            </div>

                            {/* Brands Filter */}
                            <div className="space-y-3">
                                <h3 className="font-medium text-sm">Brands</h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {brands.map((brand: any) => (
                                        <div key={brand.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`brand-${brand.id}`}
                                                checked={selectedBrands.includes(brand.id)}
                                                onCheckedChange={() => handleBrandToggle(brand.id)}
                                            />
                                            <Label
                                                htmlFor={`brand-${brand.id}`}
                                                className="text-sm font-normal cursor-pointer"
                                            >
                                                {brand.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Targets Filter */}
                            <div className="space-y-3">
                                <h3 className="font-medium text-sm">Targets</h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {targets.map((target: any) => (
                                        <div key={target.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`target-${target.id}`}
                                                checked={selectedTargets.includes(target.id)}
                                                onCheckedChange={() => handleTargetToggle(target.id)}
                                            />
                                            <Label
                                                htmlFor={`target-${target.id}`}
                                                className="text-sm font-normal cursor-pointer"
                                            >
                                                {target.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Active Ingredients Filter */}
                            <div className="space-y-3">
                                <h3 className="font-medium text-sm">Active Ingredients</h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {activeIngredients.map((ai: any) => (
                                        <div key={ai.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`ai-${ai.id}`}
                                                checked={selectedActiveIngredients.includes(ai.id)}
                                                onCheckedChange={() => handleActiveIngredientToggle(ai.id)}
                                            />
                                            <Label
                                                htmlFor={`ai-${ai.id}`}
                                                className="text-sm font-normal cursor-pointer"
                                            >
                                                {ai.name}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {chemicalsLoading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="bg-card border border-border rounded-lg overflow-hidden">
                                            <div className="aspect-square bg-muted" />
                                            <div className="p-4 space-y-3 border-t">
                                                <div className="h-3 bg-muted rounded w-1/3" />
                                                <div className="h-4 bg-muted rounded w-4/5" />
                                                <div className="h-4 bg-muted rounded w-3/5" />
                                                <div className="flex gap-4 pt-2 border-t">
                                                    <div className="h-3 bg-muted rounded w-16" />
                                                    <div className="h-3 bg-muted rounded w-16" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : chemicals.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No agrochemicals found.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                                {chemicals.map((chemical: any) => (
                                    <Link
                                        key={chemical.id}
                                        href={`/agrochemical-guides/${chemical.slug}`}
                                        className="group"
                                    >
                                        <div className="bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/50">
                                            {/* Image Section */}
                                            <div className="relative aspect-square bg-white">
                                                {chemical.images && chemical.images[0] && chemical.images[0].img?.src ? (
                                                    <Image
                                                        src={chemical.images[0].img.src}
                                                        alt={chemical.name}
                                                        fill
                                                        className="object-contain transition-transform duration-200 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                                                        <Beaker className="w-16 h-16 text-muted-foreground/30" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content Section */}
                                            <div className="p-4 space-y-3 border-t">
                                                {/* Brand */}
                                                {chemical.brand && (
                                                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                                                        {chemical.brand.name}
                                                    </p>
                                                )}

                                                {/* Product Name */}
                                                <h3 className="font-semibold text-sm leading-tight capitalize line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                                                    {chemical.name}
                                                </h3>

                                                {/* Stats */}
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                                                    <div className="flex items-center gap-1.5">
                                                        <Bug className="w-3.5 h-3.5" />
                                                        <span>{chemical.targets?.length || 0} {chemical.targets?.length === 1 ? 'target' : 'targets'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Beaker className="w-3.5 h-3.5" />
                                                        <span>{chemical.active_ingredients?.length || 0} active</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {chemicalsData?.data?.total > 20 && (
                            <div className="mt-8 flex justify-center gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </Button>
                                {Array.from({ length: Math.ceil((chemicalsData?.data?.total || 0) / 20) }, (_, i) => i + 1)
                                    .filter(pageNum => {
                                        // Show first page, last page, current page, and pages around current
                                        const totalPages = Math.ceil((chemicalsData?.data?.total || 0) / 20)
                                        return (
                                            pageNum === 1 ||
                                            pageNum === totalPages ||
                                            (pageNum >= page - 2 && pageNum <= page + 2)
                                        )
                                    })
                                    .map((pageNum, idx, arr) => {
                                        const prevPageNum = arr[idx - 1]
                                        const showEllipsis = prevPageNum && pageNum - prevPageNum > 1

                                        return (
                                            <div key={pageNum} className="flex items-center gap-1">
                                                {showEllipsis && (
                                                    <span className="px-2 text-muted-foreground">...</span>
                                                )}
                                                <Button
                                                    variant={page === pageNum ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setPage(pageNum)}
                                                    className="min-w-[40px]"
                                                >
                                                    {pageNum}
                                                </Button>
                                            </div>
                                        )
                                    })}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page >= Math.ceil((chemicalsData?.data?.total || 0) / 20)}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    )
}
