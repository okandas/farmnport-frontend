import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { MenusTable } from "@/components/structures/tables/menus"

export default async function MenusPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Menus"
        text="Manage restaurant menus."
      ></DashboardHeader>
      <MenusTable />
    </DashboardShell>
  )
}
