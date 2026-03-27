"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useRouter, useParams } from "next/navigation"
import { useDebounce } from "use-debounce"

import { queryMenuItem, updateMenuItem, queryMenuItemCategories, queryMenuItemComponents, queryMenus } from "@/lib/query"
import { MenuItem, MenuItemCategory, MenuItemComponent, CompositionEntry, Menu } from "@/lib/schemas"
import { cn, dollarsToCents, centsToDollarsFormInputs } from "@/lib/utilities"
import { buttonVariants } from "@/components/ui/button"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"
import { toast } from "@/components/ui/use-toast"
import { handleApiError, handleFetchError } from "@/lib/error-handler"
import { Placeholder } from "@/components/state/placeholder"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"

export default function EditMenuItemPage() {
    const router = useRouter()
    const params = useParams()
    const menuItemId = params.slug as string

    const [menuId, setMenuId] = useState("")
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [priceCents, setPriceCents] = useState("")
    const [categoryId, setCategoryId] = useState("")
    const [status, setStatus] = useState("active")
    const [selectedComponents, setSelectedComponents] = useState<CompositionEntry[]>([])
    const [searchComponent, setSearchComponent] = useState("")
    const [openComponents, setOpenComponents] = useState(false)
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [initialized, setInitialized] = useState(false)

    const availableTags = ["Vegetarian", "Gluten Free"]

    const handleToggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        )
    }

    const [debouncedComponentQuery] = useDebounce(searchComponent, 1000)

    // Fetch the menu item
    const { data: menuItemData, isLoading, isError } = useQuery({
        queryKey: ["menu-item", menuItemId],
        queryFn: () => queryMenuItem(menuItemId),
        refetchOnWindowFocus: false,
    })

    const menuItem = menuItemData?.data as MenuItem

    // Fetch menus for dropdown
    const { data: menuData } = useQuery({
        queryKey: ["menus-all"],
        queryFn: () => queryMenus({ p: 1 }),
        refetchOnWindowFocus: false,
    })

    const menus = (menuData?.data?.data as Menu[]) || []

    // Populate form when data loads
    useEffect(() => {
        if (menuItem && !initialized) {
            setMenuId(menuItem.menu_id || "")
            setName(menuItem.name || "")
            setDescription(menuItem.description || "")
            setPriceCents(String(centsToDollarsFormInputs(menuItem.price_cents || 0)))
            setCategoryId(menuItem.category_id || "")
            setStatus(menuItem.status || "active")
            setSelectedComponents(menuItem.composition || [])
            setSelectedTags(menuItem.tags || [])
            setInitialized(true)
        }
    }, [menuItem, initialized])

    // Fetch categories for dropdown
    const { data: categoryData } = useQuery({
        queryKey: ["menu-item-categories-all"],
        queryFn: () => queryMenuItemCategories({ p: 1 }),
        refetchOnWindowFocus: false,
    })

    const categories = (categoryData?.data?.data as MenuItemCategory[]) || []

    // Search components for composition
    const hasShownError = useRef(false)

    const { data: componentData, isError: componentError, error: componentFetchError, refetch: componentRefetch } = useQuery({
        queryKey: ["menu-item-components-search", { search: debouncedComponentQuery }],
        queryFn: () => queryMenuItemComponents({ search: debouncedComponentQuery }),
        enabled: debouncedComponentQuery.length >= 2,
        refetchOnWindowFocus: false,
    })

    useEffect(() => {
        if (componentError && !hasShownError.current) {
            hasShownError.current = true
            handleFetchError(componentFetchError, {
                onRetry: () => {
                    hasShownError.current = false
                    componentRefetch()
                },
                context: "menu item components"
            })
        }
        if (!componentError) {
            hasShownError.current = false
        }
    }, [componentError, componentFetchError, componentRefetch])

    const componentList = componentData?.data?.data as MenuItemComponent[]

    const handleToggleComponent = (component: MenuItemComponent) => {
        const exists = selectedComponents.find(c => c.component_id === component.id)
        if (exists) {
            setSelectedComponents(selectedComponents.filter(c => c.component_id !== component.id))
        } else {
            setSelectedComponents([...selectedComponents, { component_id: component.id, component_name: component.name }])
        }
    }

    const { mutate, isPending } = useMutation({
        mutationFn: updateMenuItem,
        onSuccess: () => {
            toast({
                description: "Menu item updated successfully",
            })
            router.push("/dashboard/restaurants/menu-items")
        },
        onError: (error) => {
            handleApiError(error, {
                context: "menu item update"
            })
        },
    })

    function onSubmit(e: React.FormEvent) {
        e.preventDefault()

        const effectiveMenuId = menuId || menuItem?.menu_id || ""
        const effectiveCategoryId = categoryId || menuItem?.category_id || ""

        if (!effectiveMenuId) {
            toast({ description: "Menu is required", variant: "destructive" })
            return
        }

        if (!name.trim()) {
            toast({ description: "Name is required", variant: "destructive" })
            return
        }

        if (!effectiveCategoryId) {
            toast({ description: "Category is required", variant: "destructive" })
            return
        }

        mutate({
            id: menuItemId,
            menu_id: effectiveMenuId,
            name: name.trim(),
            description: description.trim(),
            price_cents: dollarsToCents(parseFloat(priceCents || "0")),
            category_id: effectiveCategoryId,
            composition: selectedComponents,
            tags: selectedTags,
            status,
        })
    }

    if (isLoading) {
        return (
            <Placeholder>
                <Placeholder.Title>Loading Menu Item</Placeholder.Title>
            </Placeholder>
        )
    }

    if (isError) {
        return (
            <Placeholder>
                <Placeholder.Icon name="close" />
                <Placeholder.Title>Error Loading Menu Item</Placeholder.Title>
            </Placeholder>
        )
    }

    return (
        <div className="space-y-10">
<div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Edit Menu Item
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Update menu item details.
                    </p>
                </div>
                <Link
                    href="/dashboard/restaurants/menu-items"
                    className={cn(buttonVariants({ variant: "ghost" }))}
                >
                    <Icons.close className="w-4 h-4 mr-2" />
                    Close
                </Link>
            </div>

            <form onSubmit={onSubmit}>
                <div className="space-y-12">
                    <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3 dark:border-white/10">
                        <div>
                            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                                Menu Item Details
                            </h2>
                            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
                                Update the menu, name, pricing and category for this item.
                            </p>
                        </div>

                        <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
                            <div className="sm:col-span-4">
                                <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                    Menu
                                </label>
                                <div className="mt-2">
                                    <Select onValueChange={setMenuId} value={menuId || menuItem?.menu_id || ""}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a menu" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {menus.map((menu) => (
                                                <SelectItem key={menu.id} value={menu.id}>
                                                    <span className="capitalize">{menu.name}</span>
                                                    {menu.location_name && (
                                                        <span className="ml-1 text-gray-500 dark:text-gray-400">— {menu.location_name}</span>
                                                    )}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="sm:col-span-4">
                                <label htmlFor="name" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                    Name
                                </label>
                                <div className="mt-2">
                                    <Input
                                        id="name"
                                        placeholder="Enter menu item name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="col-span-full">
                                <label htmlFor="description" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                    Description
                                </label>
                                <div className="mt-2">
                                    <Textarea
                                        id="description"
                                        placeholder="e.g. Sirloin steak grilled to your liking served with eggs and chips"
                                        rows={3}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label htmlFor="price" className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                    Price ($)
                                </label>
                                <div className="mt-2">
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        placeholder="e.g. 9.99"
                                        value={priceCents}
                                        onChange={(e) => setPriceCents(e.target.value)}
                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6 dark:bg-white/5 dark:text-white dark:outline-white/10 dark:placeholder:text-gray-500 dark:focus:outline-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                    Category
                                </label>
                                <div className="mt-2">
                                    <Select onValueChange={setCategoryId} value={categoryId || menuItem?.category_id || ""}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="sm:col-span-4">
                                <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                    Status
                                </label>
                                <div className="mt-2">
                                    <Select onValueChange={setStatus} value={status}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3 dark:border-white/10">
                        <div>
                            <h2 className="text-base/7 font-semibold text-gray-900 dark:text-white">
                                Composition & Tags
                            </h2>
                            <p className="mt-1 text-sm/6 text-gray-600 dark:text-gray-400">
                                Add the ingredients that make up this dish and any dietary tags.
                            </p>
                        </div>

                        <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
                            <div className="col-span-full">
                                <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                    Composition
                                </label>

                                {selectedComponents.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2 mb-3">
                                        {selectedComponents.map(comp => (
                                            <span
                                                key={comp.component_id}
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-sm bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40"
                                                onClick={() => setSelectedComponents(selectedComponents.filter(c => c.component_id !== comp.component_id))}
                                            >
                                                {comp.component_name}
                                                <Icons.close className="w-3 h-3" />
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <Popover open={openComponents} onOpenChange={setOpenComponents}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openComponents}
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <Icons.search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                            Search and add components...
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                                        <Command shouldFilter={false}>
                                            <CommandInput
                                                placeholder="Type component name (min 2 chars)..."
                                                value={searchComponent}
                                                onValueChange={setSearchComponent}
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    {debouncedComponentQuery.length < 2
                                                        ? "Type at least 2 characters to search"
                                                        : "No components found"
                                                    }
                                                </CommandEmpty>
                                                {componentList?.map((comp) => {
                                                    const isSelected = selectedComponents.some(c => c.component_id === comp.id)
                                                    return (
                                                        <CommandItem
                                                            key={comp.id}
                                                            value={comp.id}
                                                            onSelect={() => handleToggleComponent(comp)}
                                                        >
                                                            <span className={cn(
                                                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                                                                isSelected
                                                                    ? "bg-primary border-primary text-primary-foreground"
                                                                    : "border-gray-300 dark:border-gray-600"
                                                            )}>
                                                                {isSelected && <Icons.check className="w-3 h-3" />}
                                                            </span>
                                                            {comp.name}
                                                        </CommandItem>
                                                    )
                                                })}
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <p className="mt-3 text-sm/6 text-gray-600 dark:text-gray-400">
                                    Select the components that make up this dish (e.g. Steak, Eggs, Chips).
                                </p>
                            </div>

                            <div className="col-span-full">
                                <label className="block text-sm/6 font-medium text-gray-900 dark:text-white">
                                    Tags
                                </label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {availableTags.map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => handleToggleTag(tag)}
                                            className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors",
                                                selectedTags.includes(tag)
                                                    ? "bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-900/20 dark:border-indigo-600 dark:text-indigo-300"
                                                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
                                            )}
                                        >
                                            {selectedTags.includes(tag) && <Icons.check className="w-3.5 h-3.5" />}
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button
                        type="button"
                        onClick={() => router.push("/dashboard/restaurants/menu-items")}
                        className="text-sm/6 font-semibold text-gray-900 dark:text-white"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-indigo-500 dark:shadow-none dark:hover:bg-indigo-400 dark:focus-visible:outline-indigo-500"
                    >
                        {isPending && <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />}
                        Update
                    </button>
                </div>
            </form>
        </div>
    )
}
