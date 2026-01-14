import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { BrandsTable } from "@/components/structures/tables/brands"

export default async function BrandsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Brands"
        text="Manage agro chemical brands."
      ></DashboardHeader>
      <BrandsTable />
    </DashboardShell>
  )
}
