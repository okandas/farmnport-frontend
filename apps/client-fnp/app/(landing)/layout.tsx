import { SiteHeader } from "@/components/layouts/site-header"
import { SiteFooter } from "@/components/layouts/site-footer"

import { auth } from "@/auth"
import { useState } from "react"
import { AuthenticatedUser } from "@/lib/schemas"
import { retrieveUser } from "@/lib/actions"

interface RootLayoutProps {
    children: React.ReactNode
}


export default async function LandingLayout({ children }: RootLayoutProps) {

    const user = await retrieveUser()

    return (
        <div>
            <SiteHeader user={user} />
            {children}
            <SiteFooter />

        </div>
    )
}