import { SiteHeader } from "@/components/layouts/site-header"

interface RootLayoutProps {
    children: React.ReactNode
}


export default function LandingLayout({ children }: RootLayoutProps) {
    return (
        <div>
            <SiteHeader user={null} />
            {children}
        </div>
    )
}