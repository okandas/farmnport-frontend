import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { TumiraVanityCodesTable } from "@/components/structures/tables/tumira-vanity-codes"

export default async function TumiraVanityCodesPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Vanity Codes"
        text="Premium reserved delivery point codes."
      />
      <TumiraVanityCodesTable />
    </DashboardShell>
  )
}
