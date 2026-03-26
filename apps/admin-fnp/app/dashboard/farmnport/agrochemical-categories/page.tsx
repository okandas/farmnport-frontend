import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { AgroChemicalCategoriesTable } from "@/components/structures/tables/agroChemicalCategories"

export default async function AgroChemicalCategoriesPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="AgroChemical Categories"
        text="Manage product categories for agrochemicals (Insecticides, Fungicides, Herbicides, etc.)."
      ></DashboardHeader>
      <AgroChemicalCategoriesTable />
    </DashboardShell>
  )
}
