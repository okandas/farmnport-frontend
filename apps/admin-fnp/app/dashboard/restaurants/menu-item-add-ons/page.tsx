import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { MenuItemAddOnsTable } from "@/components/structures/tables/menu-item-add-ons"

export default async function MenuItemAddOnsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Add-Ons"
        text="Manage menu item add-ons (e.g. French Fries, Side Salad)."
      ></DashboardHeader>
      <MenuItemAddOnsTable />
    </DashboardShell>
  )
}
