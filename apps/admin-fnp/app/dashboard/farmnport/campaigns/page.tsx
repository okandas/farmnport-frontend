import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { CampaignsView } from "@/components/structures/views/campaigns-view"

export const metadata = { title: "Campaigns — Farmnport Admin" }

export default function CampaignsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Campaigns" text="Track and manage email, SMS and WhatsApp campaigns." />
      <CampaignsView />
    </DashboardShell>
  )
}
