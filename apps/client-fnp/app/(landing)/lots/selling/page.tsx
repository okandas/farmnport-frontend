import { Lots } from "@/components/layouts/lots"
import { LotsSidebar } from "@/components/layouts/lots-sidebar"
import { QuickLinks } from "@/components/generic/quick-links"

export const metadata = {
    title: 'Selling Lots – Farm Produce for Sale in Zimbabwe | farmnport.com',
    description: 'Browse farm produce lots available for sale across Zimbabwe. Chillies, maize, cattle and more — buy directly from farmers.',
    alternates: { canonical: `/lots/selling` },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://farmnport.com/lots/selling",
        siteName: "Farmnport",
        title: 'Selling Lots – Farm Produce for Sale in Zimbabwe | farmnport.com',
        description: 'Browse farm produce lots available for sale across Zimbabwe.',
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Farmnport Selling Lots" }],
    },
}

export default function SellingLotsPage() {
    return (
        <main>
            <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[70lvh] py-8">
                <div className="lg:flex lg:space-x-10">
                    <div className="hidden lg:block lg:w-44 relative">
                        <LotsSidebar />
                    </div>
                    <div className="flex-1 min-w-0">
                        <Lots mode="selling" />
                    </div>
                    <div className="hidden lg:block lg:w-44 shrink-0">
                        <QuickLinks />
                    </div>
                </div>
            </div>
        </main>
    )
}
