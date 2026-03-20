import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { FeedingProgramsTable } from "@/components/structures/tables/feedingPrograms"

export default async function FeedingProgramsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Feeding Programs"
        text="Manage livestock feeding programs."
      ></DashboardHeader>
      <FeedingProgramsTable />
    </DashboardShell>
  )
}
