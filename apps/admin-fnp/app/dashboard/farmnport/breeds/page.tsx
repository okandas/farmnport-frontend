import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { BreedsTable } from "@/components/structures/tables/breeds"

export default async function BreedsPage() {
    return (
        <DashboardShell>
            <DashboardHeader
                heading="Breeds"
                text="Manage breeds and varieties for farm produce."
            />
            <BreedsTable />
        </DashboardShell>
    )
}
