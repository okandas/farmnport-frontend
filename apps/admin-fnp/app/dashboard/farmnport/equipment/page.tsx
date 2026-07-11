import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { EquipmentProductsTable } from "@/components/structures/tables/equipmentProducts"

export default async function EquipmentProductsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Equipment Products"
        text="Manage equipment products (tractors, irrigation systems, tools)."
      ></DashboardHeader>
      <EquipmentProductsTable />
    </DashboardShell>
  )
}
