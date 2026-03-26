import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { FarmProduceTable } from "@/components/structures/tables/farmProduce"

export default async function FarmProducePage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Farm Produce"
        text="Manage farm produce."
      ></DashboardHeader>
      <FarmProduceTable />
    </DashboardShell>
  )
}
