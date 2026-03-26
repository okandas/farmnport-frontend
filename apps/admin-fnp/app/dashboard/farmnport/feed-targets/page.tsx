import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { FeedTargetsTable } from "@/components/structures/tables/feedTargets"

export default async function FeedTargetsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Feed Targets"
        text="Manage target animals and conditions for feed products."
      ></DashboardHeader>
      <FeedTargetsTable />
    </DashboardShell>
  )
}
