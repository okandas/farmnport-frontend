import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { TumiraCourierRatesTable } from "@/components/structures/tables/tumira-courier-rates"

export default async function TumiraCourierRatesPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Courier Rates"
        text="All courier pricing rules."
      />
      <TumiraCourierRatesTable />
    </DashboardShell>
  )
}
