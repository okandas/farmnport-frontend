import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { MenuCategoriesTable } from "@/components/structures/tables/menu-categories"

export default async function MenuCategoriesPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Menu Categories"
        text="Manage menu categories."
      ></DashboardHeader>
      <MenuCategoriesTable />
    </DashboardShell>
  )
}
