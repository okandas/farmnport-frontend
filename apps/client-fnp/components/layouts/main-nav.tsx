"use client"

import Link from "next/link"

import { siteConfig } from "@/config/site"

import {AuthenticatedUser} from "@/lib/schemas";

import { Navigation } from "@/components/layouts/nav"

interface MainNavProps {
  user: AuthenticatedUser | null
}

export function MainNav({ user }: MainNavProps) {
    return (
      <>
        <div className="hidden lg:flex lg:flex-1">
            <Link href="/" className="hidden items-center space-x-2 lg:flex">
                <span className="hidden font-bold lg:inline-block">
                    {siteConfig.name}
                </span>
                <span className="sr-only">Home</span>
            </Link>
            <div className="flex flex-1 items-center justify-end space-x-4">
              <Navigation user={user} />
            </div>
        </div>
      </>
    )
}
