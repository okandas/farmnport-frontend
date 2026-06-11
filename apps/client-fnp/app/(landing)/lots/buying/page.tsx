import { Lots } from "@/components/layouts/lots"
import { LotsSidebar } from "@/components/layouts/lots-sidebar"
import { QuickLinks } from "@/components/generic/quick-links"

export const metadata = {
    title: 'Buying Lots – Farmers Looking to Buy Produce in Zimbabwe | farmnport.com',
    description: 'Browse buying lots from farmers and businesses looking to purchase farm produce across Zimbabwe.',
    alternates: { canonical: `/lots/buying` },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://farmnport.com/lots/buying",
        siteName: "Farmnport",
        title: 'Buying Lots – Farmers Looking to Buy Produce in Zimbabwe | farmnport.com',
        description: 'Browse buying lots from farmers and businesses looking to purchase farm produce across Zimbabwe.',
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Farmnport Buying Lots" }],
    },
}

export default function BuyingLotsPage() {
    return (
        <main>
            <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[70lvh] py-8">
                <div className="lg:flex lg:space-x-10">
                    <div className="hidden lg:block lg:w-44 relative">
                        <LotsSidebar />
                    </div>
                    <div className="flex-1 min-w-0">
                        <Lots mode="buying" />
                    </div>
                    <div className="hidden lg:block lg:w-44 shrink-0">
                        <QuickLinks />
                    </div>
                </div>
            </div>
        </main>
    )
}
