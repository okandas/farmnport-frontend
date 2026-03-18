import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { AnimalHealthCategoriesTable } from "@/components/structures/tables/animalHealthCategories"

export default async function AnimalHealthCategoriesPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Animal Health Categories"
        text="Manage product categories for animal health products (Vaccines, Antibiotics, Nutrition, etc.)."
      ></DashboardHeader>
      <AnimalHealthCategoriesTable />
    </DashboardShell>
  )
}
