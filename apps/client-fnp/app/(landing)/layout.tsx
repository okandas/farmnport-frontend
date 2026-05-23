import { SiteHeader } from "@/components/layouts/site-header"
import { SiteFooter } from "@/components/layouts/site-footer"
import { ImpersonationBanner } from "@/components/structures/impersonation-banner"

interface RootLayoutProps {
    children: React.ReactNode
}

export default function LandingLayout({ children }: RootLayoutProps) {
    return (
        <main>
            <ImpersonationBanner />
            <SiteHeader />
            {children}
            <SiteFooter />
        </main>
    )
}
