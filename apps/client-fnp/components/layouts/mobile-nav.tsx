"use client"

import * as React from "react"
import Link from "next/link"


import { siteConfig } from "@/config/site"

import {Button, buttonVariants} from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet"
import { Icons } from "@/components/icons/lucide"
import {AppURL, AuthenticatedUser} from "@/lib/schemas";

import {sendGTMEvent} from "@next/third-parties/google";
import {ThemeSwitcher} from "@/components/ui/theme-switcher";
import {signOut} from "next-auth/react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useQuery } from "@tanstack/react-query";
import { getCart } from "@/lib/query";


interface MobileNavProps {
  user: AuthenticatedUser | null
}

export function MobileNav({ user }: MobileNavProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const { openCart } = useCart()
    const { data: cartData } = useQuery({
      queryKey: ["cart"],
      queryFn: () => getCart().then((r) => r.data),
      enabled: !!user,
      staleTime: 30000,
    })
    const cartItems: any[] = (cartData as any)?.items ?? []
    const cartCount: number = cartItems.length
    const cartTotal: number = cartItems.reduce((s: number, i: any) => s + i.unit_price * i.quantity, 0)


    return (
      <div className="flex flex-1 md:hidden">
        <Link href="/" className="items-center space-x-2 flex md:hidden">
          <span className="font-bold lg:inline-block">
                    {siteConfig.name}
                </span>
          <span className="sr-only">Home</span>
        </Link>

       <div className="flex flex-1 justify-end items-center gap-1">
         {cartCount > 0 ? (
           <button
             onClick={openCart}
             className="flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-semibold"
             aria-label="Open cart"
           >
             <ShoppingCart className="w-4 h-4" />
             <span>{cartCount}</span>
             <span className="opacity-70">·</span>
             <span>${cartTotal.toFixed(2)}</span>
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
         <Sheet open={isOpen} onOpenChange={setIsOpen}>
           <SheetTrigger asChild>
             <Button
               variant="ghost"
               className="px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
             >
               <Icons.menu className="h-6 w-6" aria-hidden="true" />
               <span>Menu</span>
             </Button>
           </SheetTrigger>
           <SheetContent side="left" className="pl-1 pr-0">
             <SheetHeader>
                <SheetTitle></SheetTitle>
             </SheetHeader>
             <div className="px-7">
               <Link
                 href="/"
                 className="flex items-center"
                 onClick={() => setIsOpen(false)}
               >
                 <span className="font-bold">{siteConfig.name}</span>
                 <span className="sr-only">Home</span>
               </Link>
             </div>
             <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
               <div className="pl-1 pr-7">
                 {/* Main Navigation */}
                 <nav className="space-y-3 mb-6">
                   <Link
                     href="/guides"
                     onClick={() => {
                       sendGTMEvent({ event: 'link', value: 'GuidesTopNavigation' })
                       setIsOpen(false)
                     }}
                     className="flex items-center gap-3 px-3 py-2 text-base font-medium rounded-md hover:bg-accent transition-colors"
                   >
                     <Icons.bookOpen className="h-5 w-5" />
                     <span>Guides</span>
                   </Link>

                   <Link
                     href="/programs"
                     onClick={() => {
                       sendGTMEvent({ event: 'link', value: 'ProgramsTopNavigation' })
                       setIsOpen(false)
                     }}
                     className="flex items-center gap-3 px-3 py-2 text-base font-medium rounded-md hover:bg-accent transition-colors"
                   >
                     <Icons.sprout className="h-5 w-5" />
                     <span>Programs</span>
                   </Link>

                   <Link
                     href="/market"
                     onClick={() => {
                       sendGTMEvent({ event: 'link', value: 'MarketTopNavigation' })
                       setIsOpen(false)
                     }}
                     className="flex items-center gap-3 px-3 py-2 text-base font-medium rounded-md hover:bg-accent transition-colors"
                   >
                     <Icons.dollar className="h-5 w-5" />
                     <span>Market</span>
                   </Link>
                 </nav>

                 {/* Account Section */}
                 <div className="pt-6 mt-6 border-t space-y-3">
                   { user ? (
                     <>
                       <Link
                         href="/profile"
                         onClick={() => setIsOpen(false)}
                         className="flex items-center gap-3 px-3 py-2 text-base font-medium rounded-md hover:bg-accent transition-colors"
                       >
                         <Icons.user className="h-5 w-5" />
                         <span>Profile</span>
                       </Link>
                       <Link
                         href="/orders"
                         onClick={() => setIsOpen(false)}
                         className="flex items-center gap-3 px-3 py-2 text-base font-medium rounded-md hover:bg-accent transition-colors"
                       >
                         <Icons.arrowRight className="h-5 w-5" />
                         <span>My Orders</span>
                       </Link>
                       <button
                         onClick={() => {
                           signOut({ redirectTo: AppURL })
                           setIsOpen(false)
                         }}
                         className="flex items-center gap-3 px-3 py-2 text-base font-medium rounded-md hover:bg-accent transition-colors w-full text-left"
                       >
                         <Icons.arrowRight className="h-5 w-5" />
                         <span>Logout</span>
                       </button>
                     </>
                   ) : (
                     <>
                       <Link
                         href="/login"
                         onClick={() => setIsOpen(false)}
                         className={`${buttonVariants({ size: "lg", variant: "outline" })} w-full justify-center font-medium`}
                       >
                         Login
                       </Link>
                       <Link
                         href="/signup"
                         onClick={() => setIsOpen(false)}
                         className={`${buttonVariants({ size: "lg" })} w-full justify-center font-medium`}
                       >
                         Sign Up
                       </Link>
                     </>
                   )}
                 </div>

                 {/* Theme Switcher */}
                 <div className="pt-6 mt-6 border-t">
                   <div className="flex items-center justify-between px-3 py-2">
                     <span className="text-sm font-medium">Theme</span>
                     <ThemeSwitcher />
                   </div>
                 </div>

               </div>
             </ScrollArea>
           </SheetContent>
         </Sheet>
       </div>
      </div>
    )
}
