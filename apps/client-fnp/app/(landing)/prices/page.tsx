import {Farmers} from "@/components/layouts/farmers"
import { retrieveUser } from "@/lib/actions"
import { FilterSidebar } from "@/components/generic/filterSidebar"


export const metadata = {
  title: 'Latest Agricultural Produce Prices for Buyers and Farmers – Daily Market Rates | farmnport.com',
  description: `Stay updated with current market prices for agricultural produce. Trusted by farmers and bulk buyers for daily pricing on crops, poultry,
                and livestock across the region!,`,
  alternates: {
    canonical: `/prices`,
  }
}

export default async function PricesPage() {

  const user = await retrieveUser()

  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[70lvh]">
        <div className="lg:flex lg:space-x-10">

          <div className="hidden lg:block lg:w-44 relative">
            <FilterSidebar/>
          </div>

          <div className="lg:w-2/3">

          </div>
        </div>
      </div>
    </main>
  )
}
