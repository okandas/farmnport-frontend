import { Buyers } from "@/components/layouts/buyers"
import { retrieveUser } from "@/lib/actions"
import { FilterSidebar } from "@/components/generic/filterSidebar"


export const metadata = {
    title: 'Sell Your Farm Produce Directly – Reach Buyers Faster. | farmnport.com',
    description: `Farmers, sell your fresh produce directly to buyers! Access fairer markets,
      build customer relationships, and reduce dependency on traditional channels.`,
    alternates: {
        canonical: `/buyers`,
    },
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://farmnport.com/buyers",
        siteName: "Farmnport",
        title: 'Sell Your Farm Produce Directly – Reach Buyers Faster.',
        description: "Farmers, sell your fresh produce directly to buyers! Access fairer markets, build customer relationships, and reduce dependency on traditional channels.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Farmnport Buyers - Sell Your Farm Produce Directly",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: 'Sell Your Farm Produce Directly – Reach Buyers Faster.',
        description: "Farmers, sell your fresh produce directly to buyers! Access fairer markets, build customer relationships, and reduce dependency on traditional channels.",
        images: ["/og-image.png"],
    },
}

export default async function BuyersPage() {

    const user = await retrieveUser()

    return (
        <main>
            <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[70lvh]">
                <div className="lg:flex lg:space-x-10">

                    <div className="hidden lg:block lg:w-44 relative">
                        <FilterSidebar />
                    </div>

                    <div className="lg:w-2/3">
                        <Buyers user={user} />
                    </div>
                </div>
            </div>
        </main>
    )
}






