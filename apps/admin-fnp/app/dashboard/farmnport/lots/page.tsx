import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { LotsTable } from "@/components/structures/tables/lots"

export default async function LotsPage() {
    return (
        <DashboardShell>
            <DashboardHeader
                heading="Lots"
                text="Review and approve farm produce lots before they go live."
            />
            <LotsTable />
        </DashboardShell>
    )
}
