import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { TurtlewaxCategoriesTable } from "@/components/structures/tables/turtlewaxCategories"

export default async function TurtlewaxCategoriesPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Turtlewax Categories"
        text="Manage product categories (Glass, Interior Care, Paint Care, etc.)."
      ></DashboardHeader>
      <TurtlewaxCategoriesTable />
    </DashboardShell>
  )
}
