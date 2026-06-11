import {Farmers} from "@/components/layouts/farmers"
import { retrieveUser } from "@/lib/actions"
import { FilterSidebar } from "@/components/generic/filterSidebar"
import { QuickLinks } from "@/components/generic/quick-links"


export const metadata = {
  title: 'Buy Fresh Agricultural Produce Directly from Farmers | farmnport.com',
  description: `Looking for fresh, high-quality agricultural produce in Zimbabwe? Buy directly from local farmers for the best prices,
      farm-to-table freshness, and support for Zimbabwean agriculture. Connect with trusted suppliers today!,`,
  alternates: {
    canonical: `/farmers`,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://farmnport.com/farmers",
    siteName: "Farmnport",
    title: 'Buy Fresh Agricultural Produce Directly from Farmers',
    description: "Looking for fresh, high-quality agricultural produce in Zimbabwe? Buy directly from local farmers for the best prices, farm-to-table freshness, and support for Zimbabwean agriculture.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Farmnport Farmers - Buy Fresh Agricultural Produce",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: 'Buy Fresh Agricultural Produce Directly from Farmers',
    description: "Looking for fresh, high-quality agricultural produce in Zimbabwe? Buy directly from local farmers for the best prices, farm-to-table freshness, and support for Zimbabwean agriculture.",
    images: ["/og-image.png"],
  },
}

export default async function FarmersPage() {

  const user = await retrieveUser()

  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[70lvh] py-8">
        <div className="lg:flex lg:space-x-10">

          <div className="hidden lg:block lg:w-44 relative">
            <FilterSidebar clientType="farmers" />
          </div>

          <div className="flex-1 min-w-0">
            <Farmers user={user} />
          </div>
          <div className="hidden lg:block lg:w-44 shrink-0">
            <QuickLinks />
          </div>
        </div>
      </div>
    </main>
  )
}






