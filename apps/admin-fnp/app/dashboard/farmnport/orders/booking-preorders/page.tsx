import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { PreOrdersTable } from "@/components/structures/tables/preorders"

export default function PreOrdersPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Pre-Orders" text="Create and manage pre-order listings." />
      <PreOrdersTable />
    </DashboardShell>
  )
}
