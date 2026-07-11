import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { EquipmentCategoriesTable } from "@/components/structures/tables/equipmentCategories"

export default async function EquipmentCategoriesPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Equipment Categories"
        text="Manage product categories for equipment products (Tractors, Irrigation, Tools, etc.)."
      ></DashboardHeader>
      <EquipmentCategoriesTable />
    </DashboardShell>
  )
}
