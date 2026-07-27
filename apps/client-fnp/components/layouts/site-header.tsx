'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import { sendGTMEvent } from "@next/third-parties/google"
import { Search, ShoppingCart } from "lucide-react"
import { siteConfig } from "@/config/site"
import { MobileNav } from "@/components/layouts/mobile-nav"
import { AuthenticatedUser, AppURL } from "@/lib/schemas"
import { capitalizeFirstLetter } from "@/lib/utilities"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { makeAbbveriation } from "@/lib/utilities"
import { useQuery } from "@tanstack/react-query"
import { useCart } from "@/contexts/cart-context"
import { getCart, countBookingNotifications } from "@/lib/query"
import { SearchModal } from "@/components/structures/search-modal"

function CartIcon({ user }: { user: AuthenticatedUser | null }) {
  const { openCart } = useCart()
  const { data } = useQuery({
    queryKey: ["cart"],
    queryFn: () => getCart().then((r) => r.data),
    enabled: !!user,
    staleTime: 30000,
  })
  const items: any[] = (data as any)?.items ?? []
  const count = items.length

  return (
    <button
      onClick={openCart}
      className="relative flex items-center gap-1.5 p-2 rounded-lg hover:bg-muted transition-colors"
      aria-label="Open cart"
    >
      <ShoppingCart className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {count}
        </span>
      )}
    </button>
  )
}

const POLLING_ENABLED = process.env.NEXT_PUBLIC_ENABLE_NOTIFICATION_POLLING === "true"

function BellIcon({ user }: { user: AuthenticatedUser | null }) {
  const { data } = useQuery({
    queryKey: ["booking-notifications-count"],
    queryFn: () => countBookingNotifications().then((r) => r.data),
    enabled: !!user,
    staleTime: 30000,
    refetchInterval: POLLING_ENABLED ? 60000 : false,
    refetchIntervalInBackground: false,
  })
  const count: number = (data as any)?.count ?? 0

  if (!POLLING_ENABLED || !user || count === 0) return null

  return (
    <Button variant="outline" size="sm" asChild>
      <Link href="/account/notifications" aria-label={`${count} unread notifications`}>
        <span className="text-orange-500 font-bold">{count > 99 ? "99+" : count}</span>
      </Link>
    </Button>
  )
}

const CATEGORIES: { name: string; href: string; subcategories: { name: string; href: string; bold?: boolean }[] }[] = [
  {
    name: "Agrochemicals",
    href: "/buy-agrochemicals",
    subcategories: [
      { name: "Shop All Agrochemicals", href: "/buy-agrochemicals", bold: true },
      { name: "Insecticides", href: "/agrochemical-guides/insecticides" },
      { name: "Fungicides", href: "/agrochemical-guides/fungicides" },
      { name: "Herbicides", href: "/agrochemical-guides/herbicides" },
      { name: "Acaricides", href: "/agrochemical-guides/acaricides" },
      { name: "Nematicides", href: "/agrochemical-guides/nematicides" },
      { name: "Seed Treatments", href: "/agrochemical-guides/seed-treatments" },
      { name: "Spray Programs", href: "/spray-programs", bold: true },
    ],
  },
  {
    name: "Animal Health",
    href: "/buy-animal-health",
    subcategories: [
      { name: "Shop All Animal Health", href: "/buy-animal-health", bold: true },
      { name: "Antibiotics", href: "/animal-health-guides/antibiotics" },
      { name: "Vaccines", href: "/animal-health-guides/vaccines" },
      { name: "Tick & Flea Control", href: "/animal-health-guides/tick-flea-control" },
      { name: "Worm & Fluke Control", href: "/animal-health-guides/worm-fluke-control" },
      { name: "Nutrition & Supplements", href: "/animal-health-guides/nutrition-supplements" },
      { name: "Wound Remedies", href: "/animal-health-guides/wound-remedies" },
      { name: "Biosecurity & Disinfectants", href: "/animal-health-guides/biosecurity-disinfectants" },
      { name: "Rearing Programs", href: "/rearing-programs", bold: true },
    ],
  },
  {
    name: "Animal Feed",
    href: "/buy-feeds",
    subcategories: [
      { name: "Shop All Feeds", href: "/buy-feeds", bold: true },
      { name: "Feed Guides", href: "/feed-guides" },
      { name: "Feeding Programs", href: "/feeding-programs", bold: true },
    ],
  },
  {
    name: "Plant Nutrition",
    href: "/buy-plant-nutrition",
    subcategories: [
      { name: "Shop All Plant Nutrition", href: "/buy-plant-nutrition", bold: true },
      { name: "Fertilizers", href: "/plant-nutrition-guides/fertilizers" },
      { name: "Foliar Feeds", href: "/plant-nutrition-guides/foliar-feeds" },
      { name: "Biostimulants", href: "/plant-nutrition-guides/biostimulants" },
      { name: "Plant Growth Regulators", href: "/plant-nutrition-guides/plant-growth-regulators" },
    ],
  },
  {
    name: "Seeds",
    href: "/buy-seed-products",
    subcategories: [
      { name: "Shop All Seeds", href: "/buy-seed-products", bold: true },
      { name: "Seed Guides", href: "/seed-guides" },
    ],
  },
  {
    name: "Equipment",
    href: "/buy-equipment",
    subcategories: [
      { name: "Shop All Equipment", href: "/buy-equipment", bold: true },
      { name: "Equipment Guides", href: "/equipment-guides" },
    ],
  },
  {
    name: "Plans & Documents",
    href: "/buy-documents",
    subcategories: [
      { name: "Shop All Documents", href: "/buy-documents", bold: true },
    ],
  },
  {
    name: "Buyers",
    href: "/buyers",
    subcategories: [
      { name: "All Buyers", href: "/buyers", bold: true },
      { name: "Chicken Buyers", href: "/buyers/chicken" },
      { name: "Maize Buyers", href: "/buyers/maize" },
      { name: "Pork Buyers", href: "/buyers/pork" },
      { name: "Cattle Buyers", href: "/buyers/cattle" },
      { name: "Onion Buyers", href: "/buyers/onions" },
      { name: "Goat Buyers", href: "/buyers/goats" },
      { name: "Tomato Buyers", href: "/buyers/tomatoes" },
      { name: "Chilli Buyers", href: "/buyers/chilli" },
      { name: "Watermelon Buyers", href: "/buyers/watermelons" },
    ],
  },
  {
    name: "Farmers",
    href: "/farmers",
    subcategories: [
      { name: "All Farmers", href: "/farmers", bold: true },
      { name: "Chicken Farmers", href: "/farmers/chicken" },
      { name: "Maize Farmers", href: "/farmers/maize" },
      { name: "Pork Farmers", href: "/farmers/pork" },
      { name: "Cattle Farmers", href: "/farmers/cattle" },
      { name: "Onion Farmers", href: "/farmers/onions" },
      { name: "Goat Farmers", href: "/farmers/goats" },
      { name: "Tomato Farmers", href: "/farmers/tomatoes" },
    ],
  },
  {
    name: "Lots & Auctions",
    href: "/lots",
    subcategories: [
      { name: "Browse Lots", href: "/lots", bold: true },
      { name: "List a Lot", href: "/lots/new" },
    ],
  },
  {
    name: "Bookings",
    href: "/bookings",
    subcategories: [
      { name: "Browse Bookings", href: "/bookings", bold: true },
      { name: "Create a Booking", href: "/bookings/new" },
      { name: "I Supply", href: "/bookings/new/sell" },
      { name: "I Buy", href: "/bookings/new/buy" },
    ],
  },
  {
    name: "Market Prices",
    href: "/prices",
    subcategories: [
      { name: "All Prices", href: "/prices", bold: true },
      { name: "Cattle Prices", href: "/prices/cattle" },
      { name: "Beef Prices", href: "/prices/beef" },
      { name: "Chicken Prices", href: "/prices/chicken" },
      { name: "Pork Prices", href: "/prices/pork" },
      { name: "Goat Prices", href: "/prices/goat" },
      { name: "Lamb Prices", href: "/prices/lamb" },
      { name: "Head Prices", href: "/prices/head" },
    ],
  },
]

function ShopByCategory() {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <div className="hidden lg:block relative">
      <Button
        variant="ghost"
        size="sm"
        className="shrink-0 rounded-none text-xs font-medium gap-1"
        onClick={() => setOpen(!open)}
      >
        Select Category
        <svg
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 top-14 z-40" onClick={() => setOpen(false)} />
          <div className="fixed left-0 right-0 top-14 z-50 bottom-0 border-t bg-background overflow-y-auto">
            <div className="container flex min-h-[480px]">
              {/* Left sidebar */}
              <div className="w-[260px] border-r py-4">
                <h3 className="px-4 pb-3 text-sm font-bold">All Categories</h3>
                {CATEGORIES.map((cat, i) => (
                  <button
                    key={cat.name}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      activeIndex === i
                        ? "bg-muted font-medium text-primary"
                        : "text-foreground hover:bg-muted/50"
                    }`}
                    onClick={() => setActiveIndex(i)}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Middle — subcategories */}
              <div className="flex-1 py-4 px-8">
                <h3 className="pb-3 text-sm font-bold">{CATEGORIES[activeIndex].name}</h3>
                <div className="space-y-1">
                  {CATEGORIES[activeIndex].subcategories.map((sub) => (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      onClick={() => setOpen(false)}
                      className={`block text-sm hover:text-foreground transition-colors py-1 ${sub.bold ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Right — promo placeholder */}
              <div className="w-[280px] p-4">
                <div className="w-full h-full rounded-md bg-muted/30" />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function SiteHeader() {
  const { data: session } = useSession()
  const user = (session?.user as AuthenticatedUser) ?? undefined
  const [searchOpen, setSearchOpen] = useState(false)

  // Cmd+K keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        sendGTMEvent({ event: "search_open", method: "keyboard" })
        setSearchOpen(true)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b">
      {/* Main nav */}
      <div className="container flex h-14 items-center gap-6">
        {/* Logo */}
        <Link href="/" className="shrink-0 font-bold text-lg">
          {siteConfig.name}
        </Link>

        {/* Select Category */}
        <ShopByCategory />

        {/* Search bar — takes remaining space */}
        <div className="hidden lg:flex flex-1 items-center px-6">
          <button
            onClick={() => {
              sendGTMEvent({ event: "search_open", method: "click" })
              setSearchOpen(true)
            }}
            className="relative w-full rounded-sm bg-zinc-100 p-0.5 text-left"
          >
            <div className="flex items-center w-full h-8 pl-3 pr-10 text-sm text-muted-foreground/60">
              Search for products, guides, programs...
            </div>
            <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5">
              <kbd className="h-5 select-none items-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground inline-flex">⌘K</kbd>
            </div>
            <div className="absolute right-0.5 top-1/2 -translate-y-1/2 h-8 w-9 flex items-center justify-center rounded-sm bg-primary text-primary-foreground">
              <Search className="h-4 w-4" />
            </div>
          </button>
        </div>

        <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />

        {/* Right side actions */}
        <div className="hidden lg:flex items-center gap-2">
          <Link
            href="/prices"
            onClick={() => sendGTMEvent({ event: 'nav_click', link_name: 'prices' })}
            className={buttonVariants({ size: "sm", variant: "ghost" })}
          >
            Prices
          </Link>
          <Link
            href={user ? "/lots/new" : "/login?next=/lots/new"}
            onClick={() => sendGTMEvent({ event: 'nav_click', link_name: 'list_lot' })}
            className={buttonVariants({ size: "sm" })}
          >
            List a Lot
          </Link>
          <BellIcon user={user} />
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{makeAbbveriation(user.username)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <p className="text-sm font-medium">{capitalizeFirstLetter(user.username ?? '')}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild><Link href="/account">Account</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/orders">Orders</Link></DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ redirectTo: AppURL })}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <CartIcon user={user} />
        </div>

        {/* Mobile nav */}
        <div className="flex-1 lg:hidden" />
        <button
          onClick={() => {
            sendGTMEvent({ event: "search_open", method: "mobile_icon" })
            setSearchOpen(true)
          }}
          className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>
        <MobileNav user={user} />
      </div>
    </header>
  )
}
