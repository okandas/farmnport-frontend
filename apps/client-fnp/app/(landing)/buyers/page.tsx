import { Buyers } from "@/components/layouts/buyers"
import { retrieveUser } from "@/lib/actions"
import { ClientFilterSidebar } from "@/components/generic/clientFilterSidebar"
import { ActionsSidebar } from "@/components/generic/actions-sidebar"


export const metadata = {
    title: 'Sell Your Farm Produce Directly – Reach Buyers Faster. | farmnport.com',
    description: `Farmers, sell your fresh produce directly to buyers! Access fairer markets,
      build customer relationships, and reduce dependency on traditional channels.`,
    alternates: {
        canonical: `/buyers`,
    }
}

export default async function BuyersPage() {

    const user = await retrieveUser()

    return (
        <main>
            <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[70lvh]">
                <div className="lg:flex lg:space-x-10">

                    <div className="hidden lg:block lg:w-64 relative">
                        <ClientFilterSidebar type="buyers" />
                    </div>

                    <div className="lg:flex-1">
                        <Buyers user={user} />
                    </div>

                    <div className="hidden lg:block lg:w-80 relative">
                        <ActionsSidebar type="buyers" />
                    </div>
                </div>
            </div>
        </main>
    )
}






