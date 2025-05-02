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
                 <Link href="/prices" onClick={() => {
                   sendGTMEvent({ event: 'link', value: 'BuyerTopNavigation' })
                   setIsOpen(false)
                 }}
                 className={buttonVariants({
                   size: "sm",
                   variant: "link"
                 })}
                 >
                   <Icons.lineChart className="mr-2" /> Prices
                 </Link>
                 <Link href="/buyers" onClick={() => {
                         sendGTMEvent({ event: 'link', value: 'BuyerTopNavigation' })
                         setIsOpen(false)
                 }}
                 className={buttonVariants({
                   size: "sm",
                   variant: "link"
                 })}
                 >
                   <Icons.dollar className="mr-2" /> Buyers
                 </Link>
                 <Link href="/farmers" onClick={() => {
                   sendGTMEvent({ event: 'link', value: 'FarmerTopNavigation' })
                   setIsOpen(false)
                 }}
                 className={buttonVariants({
                   size: "sm",
                   variant: "link"
                 })}
                 >
                   <Icons.tractor className="mr-2" /> Farmers
                 </Link>
                 { user ? <div>
                   <Link href="#" onClick={() => {
                     signOut({ redirectTo: AppURL })
                     setIsOpen(false)
                   }}>
                     Logout
                   </Link>
                 </div> : (<>
                     <Link
                       href="/login"
                       onClick={() => setIsOpen(false)}
                       className={`${buttonVariants({ size: "sm", variant: "outline" })} !block py-[4px] px-[17px] mt-2`}
                     >
                       Login
                       <span className="sr-only">Login</span>
                     </Link>
                     <Link
                       href="/signup"
                       onClick={() => setIsOpen(false)}
                       className={`${buttonVariants({ size: "sm"})} !block py-[4px] px-[17px] mt-2`}
                     >
                       Sign Up
                       <span className="sr-only">Sign Up</span>
                     </Link>

                   </>

                 )}
                 <div className="mt-2 flex justify-end">
                   < ThemeSwitcher />
                 </div>

               </div>
             </ScrollArea>
           </SheetContent>
         </Sheet>
       </div>
      </div>
    )
}
