import { SiteHeader } from "@/components/layouts/site-header"
import { SiteFooter } from "@/components/layouts/site-footer"
import { retrieveUser } from "@/lib/actions"

interface RootLayoutProps {
    children: React.ReactNode
}


export default async function LandingLayout({ children }: RootLayoutProps) {

    const user = await retrieveUser()

    return (
        <main>
            <SiteHeader user={user} />
            {children}
            <SiteFooter />
        </main>
    )
}