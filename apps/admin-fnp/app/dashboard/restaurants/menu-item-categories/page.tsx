import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { MenuItemCategoriesTable } from "@/components/structures/tables/menu-item-categories"

export default async function MenuItemCategoriesPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Menu Item Categories"
        text="Manage menu item categories."
      ></DashboardHeader>
      <MenuItemCategoriesTable />
    </DashboardShell>
  )
}
