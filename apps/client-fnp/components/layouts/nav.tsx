"use client"

import * as React from "react"
import Link from "next/link"

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
import { ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/contexts/cart-context";
import { getCart } from "@/lib/query";

interface NavigationProps {
  user: AuthenticatedUser | null
}

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
  const total = items.reduce((s: number, i: any) => s + i.unit_price * i.quantity, 0)

  if (!user || count === 0) {
    return (
      <button
        onClick={openCart}
        className="relative p-2 rounded-full hover:bg-muted transition-colors"
        aria-label="Open cart"
      >
        <ShoppingCart className="w-5 h-5" />
      </button>
    )
  }

  return (
    <button
      onClick={openCart}
      className="flex items-center gap-1.5 pl-2 pr-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-semibold"
      aria-label="Open cart"
    >
      <ShoppingCart className="w-4 h-4" />
      <span>{count}</span>
      <span className="opacity-70">·</span>
      <span>${total.toFixed(2)}</span>
    </button>
  )
}

export function Navigation({ user }: NavigationProps) {
  return (
      <nav className="lg:flex lg:space-x-2">
        <Link href="/prices" onClick={() => sendGTMEvent({ event: 'link', value: 'PricesTopNavigation' })}
              className={buttonVariants({
                size: "sm",
                variant: "link"
              })}
        >
          Prices
        </Link>
        <Link href="/guides" onClick={() => sendGTMEvent({ event: 'link', value: 'GuidesTopNavigation' })}
              className={buttonVariants({
                size: "sm",
                variant: "link"
              })}
        >
          Guides
        </Link>
        <Link href="/spray-programs" onClick={() => sendGTMEvent({ event: 'link', value: 'SprayProgramsTopNavigation' })}
              className={buttonVariants({
                size: "sm",
                variant: "link"
              })}
        >
          Spray Programs
        </Link>
        <Link href="/feeding-programs" onClick={() => sendGTMEvent({ event: 'link', value: 'FeedProgramsTopNavigation' })}
              className={buttonVariants({
                size: "sm",
                variant: "link"
              })}
        >
          Feed Programs
        </Link>
        <Link href="/feeds" onClick={() => sendGTMEvent({ event: 'link', value: 'FeedsTopNavigation' })}
              className={buttonVariants({
                size: "sm",
                variant: "link"
              })}
        >
          Feeds
        </Link>
        <Link href="/buyers" onClick={() => sendGTMEvent({ event: 'link', value: 'BuyerTopNavigation' })}
              className={buttonVariants({
                size: "sm",
                variant: "link"
              })}
        >
          Buyers
        </Link>
        <Link href="/farmers" onClick={() => sendGTMEvent({ event: 'link', value: 'FarmerTopNavigation' })}
              className={buttonVariants({
                size: "sm",
                variant: "link"
              })}
        >
          Farmers
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
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">My Orders</Link>
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
        <CartIcon user={user} />
        < ThemeSwitcher />
      </nav>
  )
}
