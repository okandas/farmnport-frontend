import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { MenuItemsTable } from "@/components/structures/tables/menu-items"

export default async function MenuItemsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Menu Items"
        text="Manage menu items (dishes)."
      ></DashboardHeader>
      <MenuItemsTable />
    </DashboardShell>
  )
}
