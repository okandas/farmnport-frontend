import { SiteHeader } from "@/components/layouts/site-header"
import { SiteFooter } from "@/components/layouts/site-footer"

import { auth } from "@/auth"
import { useState } from "react"
import { AuthenticatedUser } from "@/lib/schemas"

interface RootLayoutProps {
    children: React.ReactNode
}


export default async function LandingLayout({ children }: RootLayoutProps) {
    const session = await auth()
    let user: AuthenticatedUser
    const sessionUser = session?.user

    if (sessionUser !== undefined) {

        user = {
            ...sessionUser
        }
        
    } else {
        user = undefined
    }

    return (
        <div>
            <SiteHeader user={user} />
            {children}
            <SiteFooter />

        </div>
    )
}