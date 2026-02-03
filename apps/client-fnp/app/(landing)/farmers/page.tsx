import {Farmers} from "@/components/layouts/farmers"
import { retrieveUser } from "@/lib/actions"
import { ClientFilterSidebar } from "@/components/generic/clientFilterSidebar"
import { ActionsSidebar } from "@/components/generic/actions-sidebar"


export const metadata = {
  title: 'Buy Fresh Agricultural Produce Directly from Farmers | farmnport.com',
  description: `Looking for fresh, high-quality agricultural produce in Zimbabwe? Buy directly from local farmers for the best prices,
      farm-to-table freshness, and support for Zimbabwean agriculture. Connect with trusted suppliers today!,`,
  alternates: {
    canonical: `/farmers`,
  }
}

export default async function FarmersPage() {

  const user = await retrieveUser()

  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[70lvh]">
        <div className="lg:flex lg:space-x-10">

          <div className="hidden lg:block lg:w-64 relative">
            <ClientFilterSidebar type="farmers" />
          </div>

          <div className="lg:flex-1">
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






