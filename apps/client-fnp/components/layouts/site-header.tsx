'use client'

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { signOut } from "next-auth/react"
import { sendGTMEvent } from "@next/third-parties/google"
import { Search, ShoppingCart, Sparkles } from "lucide-react"
import { AISearchOverlay } from "@/components/structures/ai-search"
import { siteConfig } from "@/config/site"
import { MobileNav } from "@/components/layouts/mobile-nav"
import { AuthenticatedUser, AppURL } from "@/lib/schemas"
import { capitalizeFirstLetter } from "@/lib/utilities"
import { Button, buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { countBookingNotifications } from "@/lib/query"
import { useUnifiedCart } from "@/hooks/use-unified-cart"

function CartIcon() {
  const { openCart } = useCart()
  const { itemCount } = useUnifiedCart()

  return (
    <button
      onClick={openCart}
      className="relative flex items-center gap-1.5 p-2 rounded-lg hover:bg-muted transition-colors"
      aria-label="Open cart"
    >
      <ShoppingCart className="w-5 h-5" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {itemCount}
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

// Grouped nav — matches mobile NAV_GROUPS
const NAV_GROUPS: { name: string; subcategories: { name: string; href: string; bold?: boolean }[] }[] = [
  {
    name: "Buy",
    subcategories: [
      { name: "Agrochemicals", href: "/buy-agrochemicals", bold: true },
      { name: "Plant Nutrition", href: "/buy-plant-nutrition", bold: true },
      { name: "Animal Health", href: "/buy-animal-health", bold: true },
      { name: "Animal Feed", href: "/buy-feeds", bold: true },
      { name: "Seeds", href: "/buy-seed-products", bold: true },
      { name: "Equipment", href: "/buy-equipment", bold: true },
      { name: "Plans & Documents", href: "/buy-documents", bold: true },
    ],
  },
  {
    name: "Sell",
    subcategories: [
      { name: "List a Lot", href: "/lots/new" },
      { name: "Create a Booking", href: "/bookings/new" },
      { name: "I Supply", href: "/bookings/new/sell" },
    ],
  },
  {
    name: "Marketplace",
    subcategories: [
      { name: "Buyers", href: "/buyers", bold: true },
      { name: "Farmers", href: "/farmers", bold: true },
      { name: "Lots & Auctions", href: "/lots", bold: true },
      { name: "Bookings", href: "/bookings", bold: true },
    ],
  },
  {
    name: "Prices",
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
  {
    name: "Guides & Programs",
    subcategories: [
      { name: "All Guides", href: "/guides", bold: true },
      { name: "Agrochemical Guides", href: "/agrochemical-guides" },
      { name: "Animal Health Guides", href: "/animal-health-guides" },
      { name: "Animal Nutrition", href: "/feed-guides" },
      { name: "Plant Nutrition Guides", href: "/plant-nutrition-guides" },
      { name: "Seed Guides", href: "/seed-guides" },
      { name: "Equipment Guides", href: "/equipment-guides" },
      { name: "All Programs", href: "/programs", bold: true },
      { name: "Spray Programs", href: "/spray-programs" },
      { name: "Feeding Programs", href: "/feeding-programs" },
      { name: "Rearing Programs", href: "/rearing-programs" },
    ],
  },
]

function SelectCategory({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
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
                {NAV_GROUPS.map((group, i) => (
                  <button
                    key={group.name}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      activeIndex === i
                        ? "bg-muted font-medium text-primary"
                        : "text-foreground hover:bg-muted/50"
                    }`}
                    onClick={() => setActiveIndex(i)}
                  >
                    {group.name}
                  </button>
                ))}
              </div>

              {/* Middle — subcategories */}
              <div className="flex-1 py-4 px-8">
                <h3 className="pb-3 text-sm font-bold">{NAV_GROUPS[activeIndex].name}</h3>
                <div className="space-y-1">
                  {NAV_GROUPS[activeIndex].subcategories.map((sub) => (
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

const SEARCH_CATEGORIES = [
  { value: "all", label: "All" },
  { value: "agro_chemicals", label: "Agrochemicals" },
  { value: "animal_health", label: "Animal Health" },
  { value: "plant_nutrition", label: "Plant Nutrition" },
  { value: "feed_products", label: "Animal Feed" },
  { value: "seed_products", label: "Seeds" },
  { value: "equipment", label: "Equipment" },
  { value: "guides", label: "Guides" },
  { value: "buyers", label: "Buyers" },
  { value: "prices", label: "Prices" },
  { value: "bookings", label: "Pre-Orders" },
  { value: "lots", label: "Lots" },
]

function NavSearchBar({ router, onFocus, onAskAI }: { router: ReturnType<typeof useRouter>; onFocus?: () => void; onAskAI: () => void }) {
  const [category, setCategory] = useState("all")

  return (
    <div className="hidden lg:flex flex-1 items-center px-6 gap-2">
      {/* <button
        type="button"
        onClick={onAskAI}
        className="shrink-0 flex items-center gap-1.5 h-9 px-3 rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-xs font-medium"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Ask AI
      </button> */}
      <form
        className="flex-1"
        onSubmit={(e) => {
          e.preventDefault()
          const input = e.currentTarget.querySelector("input[type=text]") as HTMLInputElement
          const q = input?.value?.trim()
          if (q) {
            sendGTMEvent({ event: "search_open", method: "submit" })
            const params = new URLSearchParams({ q })
            if (category !== "all") params.set("category", category)
            router.push(`/search?${params.toString()}`)
          }
        }}
      >
        <div className="relative w-full flex items-center rounded-sm bg-muted p-0.5">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-8 w-auto gap-1 border-0 border-r border-border/40 rounded-none bg-transparent text-xs font-medium text-muted-foreground shadow-none focus:ring-0 focus:ring-offset-0 shrink-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEARCH_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            type="text"
            placeholder="Search for products, guides, programs..."
            className="flex-1 h-8 pl-3 pr-12 text-sm bg-transparent outline-none placeholder:text-muted-foreground/60"
            onFocus={onFocus}
          />
          <button type="submit" className="absolute right-0.5 top-1/2 -translate-y-1/2 h-8 w-9 flex items-center justify-center rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  )
}

function MobileSearch({ router, onAskAI }: { router: ReturnType<typeof useRouter>; onAskAI: () => void }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (q) {
      sendGTMEvent({ event: "search_open", method: "mobile_submit" })
      router.push(`/search?q=${encodeURIComponent(q)}`)
      setOpen(false)
      setQuery("")
    }
  }

  return (
    <>
      {/* <button
        onClick={onAskAI}
        className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Ask AI"
      >
        <Sparkles className="h-5 w-5" />
      </button> */}
      <button
        onClick={() => {
          sendGTMEvent({ event: "search_open", method: "mobile_icon" })
          setOpen(true)
        }}
        className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Search"
      >
        <Search className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] bg-background lg:hidden">
          <div className="flex items-center gap-3 px-4 h-14 border-b">
            <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
              <div className="relative flex-1 min-w-0 flex items-center rounded-sm bg-muted p-0.5">
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search for products, guides..."
                  className="flex-1 min-w-0 h-9 pl-3 pr-10 text-sm bg-transparent outline-none placeholder:text-muted-foreground/60"
                />
                <button type="submit" className="absolute right-0.5 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>
            <button
              onClick={() => { setOpen(false); setQuery("") }}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export function SiteHeader() {
  const { data: session } = useSession()
  const user = (session?.user as AuthenticatedUser) ?? undefined
  const router = useRouter()
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [aiSearchOpen, setAiSearchOpen] = useState(false)

  // Cmd+K navigates to search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        sendGTMEvent({ event: "search_open", method: "keyboard" })
        router.push("/search")
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [router])

  return (
    <>
    {/* <AISearchOverlay open={aiSearchOpen} onClose={() => setAiSearchOpen(false)} /> */}
    <header className="sticky top-0 z-50 w-full bg-background border-b">
      {/* Main nav */}
      <div className="container flex h-14 items-center gap-2 lg:gap-6">
        {/* Logo */}
        <Link href="/" className="shrink-0 font-bold text-lg">
          {siteConfig.name}
        </Link>

        {/* Select Category */}
        <SelectCategory open={categoryOpen} setOpen={setCategoryOpen} />

        {/* Search bar — takes remaining space */}
        <NavSearchBar router={router} onFocus={() => setCategoryOpen(false)} onAskAI={() => setAiSearchOpen(true)} />

        {/* Right side actions */}
        <div className="hidden lg:flex items-center gap-2">
          {!user && (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </Link>
              <span className="text-muted-foreground/40">|</span>
              <Link
                href="/signup"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
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
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ redirectTo: AppURL })}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <CartIcon />
        </div>

        {/* Mobile nav */}
        <div className="flex-1 lg:hidden" />
        <MobileSearch router={router} onAskAI={() => setAiSearchOpen(true)} />
        <MobileNav user={user} />
      </div>
    </header>
    </>
  )
}
