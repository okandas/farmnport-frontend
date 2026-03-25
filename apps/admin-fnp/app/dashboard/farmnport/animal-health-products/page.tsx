import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { AnimalHealthProductsTable } from "@/components/structures/tables/animalHealthProducts"

export default async function AnimalHealthProductsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Animal Health Products"
        text="Manage animal health products (vaccines, antibiotics, supplements)."
      ></DashboardHeader>
      <AnimalHealthProductsTable />
    </DashboardShell>
  )
}
