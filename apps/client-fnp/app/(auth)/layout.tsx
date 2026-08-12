import { SiteHeader } from "@/components/layouts/site-header"
import { SiteFooter } from "@/components/layouts/site-footer"

interface AuthLayoutProps {
    children: React.ReactNode
}

export default async function AuthLayout({ children }: AuthLayoutProps) {

    return (
        <main>
            <SiteHeader />
            {children}
            <SiteFooter />
        </main>
    )
}
