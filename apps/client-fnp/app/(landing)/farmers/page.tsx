import {Farmers} from "@/components/layouts/farmers"
import { retrieveUser } from "@/lib/actions"
import { ClientFilterSidebar } from "@/components/generic/clientFilterSidebar"
import { ActionsSidebar } from "@/components/generic/actions-sidebar"


export const metadata = {
  title: 'Buy Fresh Agricultural Produce Directly from Farmers | farmnport.com',
  description: 'Looking for fresh, high-quality agricultural produce in Zimbabwe? Buy directly from local farmers for the best prices, farm-to-table freshness, and support for Zimbabwean agriculture.',
  alternates: {
    canonical: '/farmers',
  },
  openGraph: {
    title: 'Buy Fresh Agricultural Produce Directly from Farmers',
    description: 'Buy fresh, high-quality agricultural produce directly from local farmers across Zimbabwe at the best prices.',
    siteName: 'farmnport',
    type: 'website',
  },
}

export default async function FarmersPage() {

  const user = await retrieveUser()

  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[70lvh]">
        <h1 className="text-3xl font-bold font-heading pt-8 pb-4">
          Farmers Selling Fresh Produce in Zimbabwe
        </h1>
        <p className="text-muted-foreground mb-6">
          Buy fresh, high-quality agricultural produce directly from local farmers across Zimbabwe at the best prices.
        </p>
        <div className="lg:flex lg:space-x-10">

          <div className="hidden lg:block lg:w-64 relative">
            <ClientFilterSidebar type="farmers" />
          </div>

          <div className="lg:flex-1">
            <div className="lg:hidden mb-4">
              <ClientFilterSidebar type="farmers" />
            </div>
            <Farmers user={user} />
          </div>

          <div className="hidden lg:block lg:w-80 relative">
            <ActionsSidebar type="farmers" />
          </div>
        </div>
      </div>
    </main>
  )
}






