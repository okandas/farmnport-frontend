import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { TumiraDeliveryPointsTable } from "@/components/structures/tables/tumira-delivery-points"

export default async function TumiraDeliveryPointsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Collection Points"
        text="Registered Collection point codes."
      />
      <TumiraDeliveryPointsTable />
    </DashboardShell>
  )
}
