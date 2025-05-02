import {Farmers} from "@/components/layouts/farmers"
import { retrieveUser } from "@/lib/actions"
import { FilterSidebar } from "@/components/generic/filterSidebar"


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

          <div className="hidden lg:block lg:w-44 relative">
            <FilterSidebar />
          </div>

          <div className="lg:w-2/3">
            <Farmers user={user} />
          </div>
        </div>
      </div>
    </main>
  )
}






