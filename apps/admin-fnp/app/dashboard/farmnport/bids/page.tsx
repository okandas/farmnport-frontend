import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { BidsTable } from "@/components/structures/tables/bids"

export default async function BidsPage() {
    return (
        <DashboardShell>
            <DashboardHeader
                heading="Bids"
                text="Review incoming bids and accept winners. Accepting a bid auto-rejects all other bids on the same lot."
            />
            <BidsTable />
        </DashboardShell>
    )
}
