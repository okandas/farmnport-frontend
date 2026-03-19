import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { FeedActiveIngredientsTable } from "@/components/structures/tables/feedActiveIngredients"

export default async function FeedActiveIngredientsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Feed Active Ingredients"
        text="Manage active ingredients for feed products."
      ></DashboardHeader>
      <FeedActiveIngredientsTable />
    </DashboardShell>
  )
}
