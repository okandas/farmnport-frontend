import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { ProducePriceLists } from "@/components/structures/tables/producerPriceLists"

export default async function DashboardUsersPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Producer Price Lists"
        text="Manage Price Lists."
      ></DashboardHeader>
      <ProducePriceLists />
    </DashboardShell>
  )
}
