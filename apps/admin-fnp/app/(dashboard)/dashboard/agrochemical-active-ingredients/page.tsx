import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { AgroChemicalActiveIngredientsTable } from "@/components/structures/tables/agroChemicalActiveIngredients"

export default async function AgroChemicalActiveIngredientsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="AgroChemical Active Ingredients"
        text="Manage active ingredients for agrochemical products."
      ></DashboardHeader>
      <AgroChemicalActiveIngredientsTable />
    </DashboardShell>
  )
}
