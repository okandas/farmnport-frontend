'use client'

import { MainNav } from "@/components/layouts/main-nav"
import { MobileNav } from "@/components/layouts/mobile-nav"
import {  AuthenticatedUser } from "@/lib/schemas"

interface SiteHeaderProps {
  user: AuthenticatedUser | null
}

export function SiteHeader({ user }: SiteHeaderProps) {

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center px-4">
        <MainNav user={user}/>
        <MobileNav user={user}/>
      </div>
    </header>
  )
}
