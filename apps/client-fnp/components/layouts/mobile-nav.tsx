"use client"

import * as React from "react"
import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"


import { siteConfig } from "@/config/site"

import {Button, buttonVariants} from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet"
import { Icons } from "@/components/icons/lucide"
import {AppURL, AuthenticatedUser} from "@/lib/schemas";

import {sendGTMEvent} from "@next/third-parties/google";
import {ThemeSwitcher} from "@/components/ui/theme-switcher";
import {signOut} from "next-auth/react";

interface MobileNavProps {
  user: AuthenticatedUser | null
}

export function MobileNav({ user }: MobileNavProps) {
    const segment = useSelectedLayoutSegment()
    const [isOpen, setIsOpen] = React.useState(false)


    return (
      <div className="flex flex-1 md:hidden">
        <Link href="/" className="items-center space-x-2 flex md:hidden">
          <Icons.logo className="h-6 w-6" aria-hidden="true" />
          <span className="font-bold lg:inline-block">
                    {siteConfig.name}
                </span>
          <span className="sr-only">Home</span>
        </Link>

       <div className="flex flex-1 justify-end">
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
                 <Icons.logo className="mr-2 h-4 w-4" aria-hidden="true" />
                 <span className="font-bold">{siteConfig.name}</span>
                 <span className="sr-only">Home</span>
               </Link>
             </div>
             <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
               <div className="pl-1 pr-7">
                 {/* Main Navigation */}
                 <nav className="space-y-3 mb-6">
                   <Link
                     href="/prices"
                     onClick={() => {
                       sendGTMEvent({ event: 'link', value: 'PricesTopNavigation' })
                       setIsOpen(false)
                     }}
                     className="flex items-center gap-3 px-3 py-2 text-base font-medium rounded-md hover:bg-accent transition-colors"
                   >
                     <Icons.lineChart className="h-5 w-5" />
                     <span>Prices</span>
                   </Link>

                   <Link
                     href="/agrochemical-guides"
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
                     href="/buyers"
                     onClick={() => {
                       sendGTMEvent({ event: 'link', value: 'BuyerTopNavigation' })
                       setIsOpen(false)
                     }}
                     className="flex items-center gap-3 px-3 py-2 text-base font-medium rounded-md hover:bg-accent transition-colors"
                   >
                     <Icons.dollar className="h-5 w-5" />
                     <span>Buyers</span>
                   </Link>

                   <Link
                     href="/farmers"
                     onClick={() => {
                       sendGTMEvent({ event: 'link', value: 'FarmerTopNavigation' })
                       setIsOpen(false)
                     }}
                     className="flex items-center gap-3 px-3 py-2 text-base font-medium rounded-md hover:bg-accent transition-colors"
                   >
                     <Icons.tractor className="h-5 w-5" />
                     <span>Farmers</span>
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
