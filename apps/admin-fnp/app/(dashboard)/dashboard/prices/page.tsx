import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { AdminProducePriceLists } from "@/components/structures/tables/adminProducerPriceLists"

export default async function DashboardUsersPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Producer Price Lists"
        text="Manage Price Lists."
      ></DashboardHeader>
      <AdminProducePriceLists />
    </DashboardShell>
  )
}
