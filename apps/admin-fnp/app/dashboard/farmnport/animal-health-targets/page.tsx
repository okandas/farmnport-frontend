import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { AnimalHealthTargetsTable } from "@/components/structures/tables/animalHealthTargets"

export default async function AnimalHealthTargetsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Animal Health Targets"
        text="Manage diseases and conditions that animal health products target."
      ></DashboardHeader>
      <AnimalHealthTargetsTable />
    </DashboardShell>
  )
}
