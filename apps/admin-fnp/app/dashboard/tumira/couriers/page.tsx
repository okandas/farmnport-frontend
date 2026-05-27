import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { TumiraCouriersTable } from "@/components/structures/tables/tumira-couriers"

export default async function TumiraCouriersPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Couriers"
        text="Manage courier partners."
      />
      <TumiraCouriersTable />
    </DashboardShell>
  )
}
