import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { AgroChemicalsTable } from "@/components/structures/tables/products"

export default async function AgroChemicalsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="AgroChemicals Lists"
        text="Manage AgroChemicals."
      ></DashboardHeader>
      <AgroChemicalsTable />
    </DashboardShell>
  )
}
