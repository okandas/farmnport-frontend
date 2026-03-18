import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { AnimalHealthActiveIngredientsTable } from "@/components/structures/tables/animalHealthActiveIngredients"

export default async function AnimalHealthActiveIngredientsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Animal Health Active Ingredients"
        text="Manage active ingredients for animal health products."
      ></DashboardHeader>
      <AnimalHealthActiveIngredientsTable />
    </DashboardShell>
  )
}
