"use client"

import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { OrdersTable } from "@/components/structures/tables/orders"

export default function SalesOrdersPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Sales Orders" text="Manage shop orders." />
      <OrdersTable />
    </DashboardShell>
  )
}
