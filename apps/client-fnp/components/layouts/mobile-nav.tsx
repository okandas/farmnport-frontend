"use client"

import * as React from "react"
import Link from "next/link"

import { siteConfig } from "@/config/site"

import { Button, buttonVariants } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet"
import { Icons } from "@/components/icons/lucide"
import { AppURL, AuthenticatedUser } from "@/lib/schemas"

import { sendGTMEvent } from "@next/third-parties/google"
import { ThemeSwitcher } from "@/components/ui/theme-switcher"
import { signOut } from "next-auth/react"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useQuery } from "@tanstack/react-query"
import { getCart, countBookingNotifications } from "@/lib/query"
import { centsToDollars } from "@/lib/utilities"

// Grouped nav — matches desktop SelectCategory
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

interface MobileNavProps {
  user: AuthenticatedUser | null
}

export function MobileNav({ user }: MobileNavProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [activeCategory, setActiveCategory] = React.useState<number | null>(null)
    const { openCart } = useCart()
    const { data: cartData } = useQuery({
      queryKey: ["cart"],
      queryFn: () => getCart().then((r) => r.data),
      enabled: !!user,
      staleTime: 30000,
    })
    const cartItems: any[] = (cartData as any)?.items ?? []
    const cartCount: number = cartItems.length
    const cartTotalCents: number = cartItems.reduce((s: number, i: any) => s + (i.unit_price * i.quantity), 0)

    const pollingEnabled = process.env.NEXT_PUBLIC_ENABLE_NOTIFICATION_POLLING === "true"
    const { data: notifData } = useQuery({
      queryKey: ["booking-notifications-count"],
      queryFn: () => countBookingNotifications().then((r) => r.data),
      enabled: !!user && pollingEnabled,
      staleTime: 30000,
    })
    const notifCount: number = pollingEnabled ? ((notifData as any)?.count ?? 0) : 0

    function handleClose() {
      setIsOpen(false)
      setActiveCategory(null)
    }

    return (
      <div className="flex lg:hidden items-center gap-1">
         {user && notifCount > 0 && (
           <Link
             href="/account/notifications"
             className="min-w-[22px] h-[22px] px-1.5 inline-flex items-center justify-center rounded-full bg-orange-500 text-white text-[11px] font-bold tabular-nums hover:bg-orange-600 transition-colors"
             style={{ lineHeight: 1, paddingTop: 1 }}
             aria-label={`${notifCount} unread notifications`}
           >
             {notifCount > 99 ? "99+" : notifCount}
           </Link>
         )}
         {cartCount > 0 ? (
           <button
             onClick={openCart}
             className="flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-semibold"
             aria-label="Open cart"
           >
             <ShoppingCart className="w-4 h-4" />
             <span>{cartCount}</span>
             <span className="opacity-70">·</span>
             <span>{centsToDollars(cartTotalCents)}</span>
           </button>
         ) : (
           <button
             onClick={openCart}
             className="relative p-2 rounded-full hover:bg-muted transition-colors"
             aria-label="Open cart"
           >
             <ShoppingCart className="w-5 h-5" />
           </button>
         )}
         <Sheet open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) setActiveCategory(null) }}>
           <SheetTrigger asChild>
             <Button
               variant="ghost"
               className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
             >
               <Icons.menu className="h-6 w-6" aria-hidden="true" />
               <span className="sr-only">Menu</span>
             </Button>
           </SheetTrigger>
           <SheetContent side="left" className="p-0 w-[300px]">
             <SheetHeader className="sr-only">
                <SheetTitle>Menu</SheetTitle>
             </SheetHeader>

             {/* Header */}
             <div className="flex items-center justify-between px-5 py-4 border-b">
               {activeCategory !== null ? (
                 <div>
                   <button
                     onClick={() => setActiveCategory(null)}
                     className="flex items-center gap-1 text-xs text-primary mb-0.5"
                   >
                     <Icons.chevronLeft className="h-3 w-3" />
                     Main Menu
                   </button>
                   <h2 className="text-lg font-bold">{NAV_GROUPS[activeCategory].name}</h2>
                 </div>
               ) : (
                 <div>
                   {!user && <p className="text-sm text-muted-foreground mb-1">Sign in for a better experience</p>}
                   <Link href="/" onClick={handleClose} className="font-bold text-lg">{siteConfig.name}</Link>
                 </div>
               )}
             </div>

             {/* Auth prompt for logged-out users */}
             {!user && activeCategory === null && (
               <div className="px-5 py-4 border-b space-y-2">
                 <Link
                   href="/login"
                   onClick={handleClose}
                   className={`${buttonVariants({ size: "lg" })} w-full justify-center font-medium`}
                 >
                   Login
                 </Link>
                 <p className="text-center text-sm text-muted-foreground">
                   New to farmnport?{" "}
                   <Link href="/signup" onClick={handleClose} className="text-primary font-medium">Register</Link>
                 </p>
               </div>
             )}

             <ScrollArea className="h-[calc(100vh-5rem)]">
               <div className="py-2">
                 {activeCategory === null ? (
                   <>
                     {/* Main menu items */}
                     <nav>
                       <Link
                         href="/"
                         onClick={handleClose}
                         className="flex items-center px-5 py-3 text-[15px] font-medium hover:bg-accent transition-colors"
                       >
                         Home
                       </Link>

                       {/* Nav groups — Buy, Sell, Marketplace, Guides & Programs */}
                       {NAV_GROUPS.map((group, i) => (
                         <button
                           key={group.name}
                           onClick={() => setActiveCategory(i)}
                           className="flex items-center justify-between w-full px-5 py-3 text-[15px] font-medium hover:bg-accent transition-colors"
                         >
                           <span>{group.name}</span>
                           <Icons.chevronRight className="h-4 w-4 text-muted-foreground" />
                         </button>
                       ))}

                       {/* Prices — direct link */}
                       <Link
                         href="/prices"
                         onClick={() => { sendGTMEvent({ event: 'nav_click', link_name: 'prices' }); handleClose() }}
                         className="flex items-center px-5 py-3 text-[15px] font-medium hover:bg-accent transition-colors"
                       >
                         Prices
                       </Link>
                     </nav>

                     {/* Account */}
                     {user && (
                       <div className="border-t mt-2 pt-2">
                         <Link
                           href="/account"
                           onClick={handleClose}
                           className="flex items-center px-5 py-3 text-[15px] font-medium hover:bg-accent transition-colors"
                         >
                           Account
                         </Link>

                         <button
                           onClick={() => { signOut({ redirectTo: AppURL }); handleClose() }}
                           className="flex items-center px-5 py-3 text-[15px] font-medium hover:bg-accent transition-colors w-full text-left"
                         >
                           Logout
                         </button>
                       </div>
                     )}

                     {/* Theme */}
                     <div className="border-t mt-2 pt-2 px-5 py-3">
                       <div className="flex items-center justify-between">
                         <span className="text-sm font-medium">Theme</span>
                         <ThemeSwitcher />
                       </div>
                     </div>
                   </>
                 ) : (
                   /* Subcategory list for selected group */
                   <nav>
                     {NAV_GROUPS[activeCategory].subcategories.map((sub) => (
                       <Link
                         key={sub.name}
                         href={sub.href}
                         onClick={handleClose}
                         className={`block px-5 py-3 text-[15px] hover:bg-accent transition-colors ${sub.bold ? "font-semibold" : "text-muted-foreground"}`}
                       >
                         {sub.name}
                       </Link>
                     ))}
                   </nav>
                 )}
               </div>
             </ScrollArea>
           </SheetContent>
         </Sheet>
      </div>
    )
}
