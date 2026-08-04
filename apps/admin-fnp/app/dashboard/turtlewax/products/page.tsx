import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { TurtlewaxProductsTable } from "@/components/structures/tables/turtlewax"

export default async function TurtlewaxProductsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Turtlewax Products"
        text="Manage Turtlewax products."
      ></DashboardHeader>
      <TurtlewaxProductsTable />
    </DashboardShell>
  )
}
