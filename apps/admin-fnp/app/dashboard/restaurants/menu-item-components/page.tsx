import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { MenuItemComponentsTable } from "@/components/structures/tables/menu-item-components"

export default async function MenuItemComponentsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Menu Item Components"
        text="Manage menu item components (building blocks of dishes)."
      ></DashboardHeader>
      <MenuItemComponentsTable />
    </DashboardShell>
  )
}
