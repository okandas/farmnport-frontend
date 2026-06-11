import { Lots } from "@/components/layouts/lots"
import { LotsSidebar } from "@/components/layouts/lots-sidebar"
import { QuickLinks } from "@/components/generic/quick-links"

export const metadata = {
    title: 'Upcoming Lots – Awaiting Review | farmnport.com',
    description: 'Farm produce lots submitted and awaiting moderation review before going live on Farmnport.',
    alternates: { canonical: `/lots/upcoming` },
}

export default function UpcomingLotsPage() {
    return (
        <main>
            <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[70lvh] py-8">
                <div className="lg:flex lg:space-x-10">
                    <div className="hidden lg:block lg:w-44 relative">
                        <LotsSidebar />
                    </div>
                    <div className="flex-1 min-w-0">
                        <Lots mode="pending" />
                    </div>
                    <div className="hidden lg:block lg:w-44 shrink-0">
                        <QuickLinks />
                    </div>
                </div>
            </div>
        </main>
    )
}
