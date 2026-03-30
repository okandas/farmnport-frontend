import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { OrdersTable } from "@/components/structures/tables/orders"

export default async function OrdersPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Orders" text="Manage customer orders." />
      <OrdersTable />
    </DashboardShell>
  )
}
