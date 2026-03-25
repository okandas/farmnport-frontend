import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { SprayProgramsTable } from "@/components/structures/tables/sprayPrograms"

export default async function SprayProgramsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Spray Programs"
        text="Manage spray programs."
      ></DashboardHeader>
      <SprayProgramsTable />
    </DashboardShell>
  )
}
