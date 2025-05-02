"use client"

import * as React from "react"
import Link from "next/link"

import { siteConfig } from "@/config/site"

import { Icons } from "@/components/icons/lucide"
import {sendGTMEvent} from "@next/third-parties/google";
import {Button, buttonVariants} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Avatar, AvatarFallback} from "@/components/ui/avatar";
import {capitalizeFirstLetter, makeAbbveriation} from "@/lib/utilities";
import {signOut} from "next-auth/react";
import {AppURL, AuthenticatedUser} from "@/lib/schemas";
import {ThemeSwitcher} from "@/components/ui/theme-switcher";

interface NavigationProps {
  user: AuthenticatedUser | null
}

export function Navigation({ user }: NavigationProps) {
  return (
      <nav className="lg:flex lg:space-x-2">
        <Link href="/prices" onClick={() => sendGTMEvent({ event: 'link', value: 'BuyerTopNavigation' })}
              className={buttonVariants({
                size: "sm",
                variant: "link"
              })}
        >
          <Icons.lineChart className="mr-2" /> Prices
        </Link>
        <Link href="/buyers" onClick={() => sendGTMEvent({ event: 'link', value: 'BuyerTopNavigation' })}
              className={buttonVariants({
                size: "sm",
                variant: "link"
              })}
        >
          <Icons.dollar className="mr-2" /> Buyers
        </Link>
        <Link href="/farmers" onClick={() => sendGTMEvent({ event: 'link', value: 'FarmerTopNavigation' })}
              className={buttonVariants({
                size: "sm",
                variant: "link"
              })}
        >
          <Icons.tractor className="mr-2" /> Farmers
        </Link>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  {/* <AvatarImage
                        src={user.imageUrl}
                        alt={user.username ?? ""}
                    />
                    <AvatarFallback>{initials}</AvatarFallback>
                  */}
                  <AvatarFallback>{makeAbbveriation(user.username)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-base font-medium leading-none">
                    {capitalizeFirstLetter(user.username ?? '')}
                  </p>
                  {/*
                    <p className="text-xs leading-none text-muted-foreground">
                        {email}
                    </p>
                   */}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    {/* <DashboardIcon
                        className="mr-2 h-4 w-4"
                        aria-hidden="true"
                    /> */}
                    Profile
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="#" onClick={() => signOut({ redirectTo: AppURL })}>
                    {/* <DashboardIcon
                        className="mr-2 h-4 w-4"
                        aria-hidden="true"
                    /> */}
                    Logout
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>

            </DropdownMenuContent>
          </DropdownMenu>
        ) : (<>
            <Link
              href="/login"
              className={`${buttonVariants({ size: "sm", variant: "outline" })}`}
            >
              Login
              <span className="sr-only">Login</span>
            </Link>
            <Link
              href="/signup"
              className={buttonVariants({
                size: "sm",
              })}
            >
              Sign Up
              <span className="sr-only">Sign Up</span>
            </Link>
          </>

        )}
        < ThemeSwitcher />
      </nav>
  )
}
