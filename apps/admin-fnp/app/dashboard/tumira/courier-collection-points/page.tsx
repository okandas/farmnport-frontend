import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { TumiraCourierCollectionPointsTable } from "@/components/structures/tables/tumira-courier-collection-points"

export default async function TumiraCourierCollectionPointsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Courier Collection Points"
        text="Couriers linked to collection points."
      />
      <TumiraCourierCollectionPointsTable />
    </DashboardShell>
  )
}
