import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { TumiraWardsTable } from "@/components/structures/tables/tumira-wards"

export default async function TumiraWardsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Wards"
        text="All Zimbabwe delivery wards."
      />
      <TumiraWardsTable />
    </DashboardShell>
  )
}
