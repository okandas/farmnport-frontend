import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { SeedProductsTable } from "@/components/structures/tables/seedProducts"

export default async function SeedProductsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Seed Products"
        text="Manage seed and planting material guide listings."
      />
      <SeedProductsTable />
    </DashboardShell>
  )
}
