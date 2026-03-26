import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { CdmPriceLists } from "@/components/structures/tables/cdmPriceLists"

export default async function DashboardCdmPricesPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="CDM Price Lists"
        text="Manage Cold Dress Mass cattle pricing."
      ></DashboardHeader>
      <CdmPriceLists />
    </DashboardShell>
  )
}
