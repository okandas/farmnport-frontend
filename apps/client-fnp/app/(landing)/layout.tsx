import { SiteHeader } from "@/components/layouts/site-header"
import { SiteFooter } from "@/components/layouts/site-footer"

interface RootLayoutProps {
    children: React.ReactNode
}


export default function LandingLayout({ children }: RootLayoutProps) {
    return (
        <div>
            <SiteHeader user={null} />
            {children}
            <SiteFooter />

        </div>
    )
}