import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { FarmProduceCategoriesTable } from "@/components/structures/tables/farmProduceCategories"

export default async function FarmProduceCategoriesPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Farm Produce Categories"
        text="Manage farm produce categories."
      ></DashboardHeader>
      <FarmProduceCategoriesTable />
    </DashboardShell>
  )
}
