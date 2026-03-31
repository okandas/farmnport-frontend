import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { CuisineCategoriesTable } from "@/components/structures/tables/cuisine-categories"

export default async function CuisineCategoriesPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Cuisine Categories"
        text="Manage cuisine categories."
      ></DashboardHeader>
      <CuisineCategoriesTable />
    </DashboardShell>
  )
}
