import Link from "next/link"

import { siteConfig } from "@/config/site"
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
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Icons } from "@/components/icons/lucide"
import { MainNav } from "@/components/layouts/main-nav"
import { MobileNav } from "@/components/layouts/mobile-nav"

interface SiteHeaderProps {
    user: null
}

export function SiteHeader({ user }: SiteHeaderProps) {

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background">
            <div className="container flex h-16 items-center">
                <MainNav />
                <MobileNav />
                <div className="flex flex-1 items-center justify-end space-x-4">
                    <nav className="flex items-center space-x-2">
                        <Button
                            className={buttonVariants({
                                size: "sm",
                                variant: "secondary"
                            })}
                        >
                            <Icons.dollar className="mr-2" /> Buyers
                        </Button>
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
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            {/* <p className="text-sm font-medium leading-none">
                                                {user.firstName} {user.lastName}
                                            </p>
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

                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link
                                href="/signup"
                                className={buttonVariants({
                                    size: "sm",
                                })}
                            >
                                Sign Up
                                <span className="sr-only">Sign Up</span>
                            </Link>
                        )}
                        < ThemeSwitcher />
                    </nav>
                </div>
            </div>
        </header>
    )
}