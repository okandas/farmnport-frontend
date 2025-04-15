'use client'

import Link from "next/link"

import { sendGTMEvent } from '@next/third-parties/google'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import { ThemeSwitcher } from "@/components/ui/theme-switcher"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Icons } from "@/components/icons/lucide"
import { MainNav } from "@/components/layouts/main-nav"
import { MobileNav } from "@/components/layouts/mobile-nav"
import { AppURL, AuthenticatedUser } from "@/lib/schemas"
import { capitalizeFirstLetter, makeAbbveriation } from "@/lib/utilities"
import { signOut } from "next-auth/react"

interface SiteHeaderProps {
    user: AuthenticatedUser | null
}

export function SiteHeader({ user }: SiteHeaderProps) {

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background">
            <div className="container flex h-16 items-center">
                <MainNav />
                <MobileNav />
                <div className="flex flex-1 items-center justify-end space-x-4">
                    <nav className="flex items-center space-x-2">
                        <Link href="/buyers" onClick={() => sendGTMEvent({ event: 'link', value: 'BuyerTopNavigation' })}
                            className={buttonVariants({
                                size: "sm",
                                variant: "secondary"
                            })}
                        >
                            <Icons.dollar className="mr-2" /> Buyers
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
                                            <AvatarFallback>{initials}</AvatarFallback> */}
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
                                            </p> */}
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
                                            <Link href="#" onClick={() => signOut({ redirectTo: '/' })}>
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
                                className={buttonVariants({
                                    size: "sm",
                                    variant: "outline"
                                })}
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
                </div>
            </div>
        </header>
    )
}
