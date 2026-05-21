import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { BlastView } from "@/components/structures/views/blast-view"

export const metadata = { title: "Blast — Farmnport Admin" }

export default function BlastPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Blast" text="Send targeted SMS, WhatsApp, or email messages to farmers and buyers." />
      <BlastView />
    </DashboardShell>
  )
}
