import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { AgroChemicalTargetsTable } from "@/components/structures/tables/agroChemicalTargets"

export default async function AgroChemicalTargetsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="AgroChemical Targets"
        text="Manage pests and diseases that agrochemical products target."
      ></DashboardHeader>
      <AgroChemicalTargetsTable />
    </DashboardShell>
  )
}
