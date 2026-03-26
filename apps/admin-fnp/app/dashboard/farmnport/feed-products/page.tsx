import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { FeedProductsTable } from "@/components/structures/tables/feedProducts"

export default async function FeedProductsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Feed Products"
        text="Manage livestock feed products."
      ></DashboardHeader>
      <FeedProductsTable />
    </DashboardShell>
  )
}
