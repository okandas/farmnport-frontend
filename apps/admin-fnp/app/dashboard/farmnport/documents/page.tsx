import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { DocumentsTable } from "@/components/structures/tables/documents"

export default async function DocumentsPage() {
    return (
        <DashboardShell>
            <DashboardHeader
                heading="Documents"
                text="Manage digital documents available for purchase."
            />
            <DocumentsTable />
        </DashboardShell>
    )
}
