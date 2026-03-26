import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { WeedGroupsTable } from "@/components/structures/tables/weedGroups"

export default async function WeedGroupsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Weed Groups"
        text="Manage weed groups (e.g., Annual Grasses) for batch target selection in dosage rates."
      ></DashboardHeader>
      <WeedGroupsTable />
    </DashboardShell>
  )
}
