import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { LivestockPoultryTable } from "@/components/structures/tables/livestockPoultry"

export default async function LivestockPoultryPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Livestock & Poultry"
        text="Manage livestock and poultry guide listings."
      />
      <LivestockPoultryTable />
    </DashboardShell>
  )
}
