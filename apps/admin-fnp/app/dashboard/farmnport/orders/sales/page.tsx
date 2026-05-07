import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { OrdersTable } from "@/components/structures/tables/orders"

export default async function SalesOrdersPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Sales Orders" text="Manage customer orders." />
      <OrdersTable />
    </DashboardShell>
  )
}
