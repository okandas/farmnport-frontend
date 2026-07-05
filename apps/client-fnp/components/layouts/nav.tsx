"use client"

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
import {capitalizeFirstLetter, makeAbbveriation, centsToDollars} from "@/lib/utilities";
import {signOut} from "next-auth/react";
import {AppURL, AuthenticatedUser} from "@/lib/schemas";
import { ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/contexts/cart-context";
import { getCart, countBookingNotifications } from "@/lib/query";

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
  const totalCents = items.reduce((s: number, i: any) => s + (i.unit_price * i.quantity), 0)

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
      <span>{centsToDollars(totalCents)}</span>
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

  if (!user || count === 0) return null

  return (
    <Button variant="outline" size="sm" asChild>
      <Link href="/account/notifications" aria-label={`${count} unread notifications`}>
        <span className="text-orange-500 font-bold">{count > 99 ? "99+" : count}</span>
      </Link>
    </Button>
  )
}

export function Navigation({ user }: NavigationProps) {
  return (
      <nav className="lg:flex lg:space-x-2">
        <Link href="/guides" onClick={() => sendGTMEvent({ event: 'nav_click', link_name: 'guides' })}
              className={buttonVariants({ size: "sm", variant: "link" })}
        >
          Guides
        </Link>
        <Link href="/programs" onClick={() => sendGTMEvent({ event: 'nav_click', link_name: 'programs' })}
              className={buttonVariants({ size: "sm", variant: "link" })}
        >
          Programs
        </Link>
        <Link href="/market" onClick={() => sendGTMEvent({ event: 'nav_click', link_name: 'market' })}
              className={buttonVariants({ size: "sm", variant: "link" })}
        >
          Market
        </Link>
        <Link href="/buy" onClick={() => sendGTMEvent({ event: 'nav_click', link_name: 'buy' })}
              className={buttonVariants({ size: "sm", variant: "link" })}
        >
          Buy
        </Link>
        <Link
          href={user ? "/lots/new" : "/login?next=/lots/new"}
          onClick={() => sendGTMEvent({ event: 'nav_click', link_name: 'list_lot' })}
          className={`${buttonVariants({ size: "sm" })} mr-2`}
        >
          List a Lot
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
                  <Link href="/account">Account</Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => signOut({ redirectTo: AppURL })}>
                  Logout
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
        <span className="ml-4"><BellIcon user={user} /></span>
        <CartIcon user={user} />
      </nav>
  )
}
