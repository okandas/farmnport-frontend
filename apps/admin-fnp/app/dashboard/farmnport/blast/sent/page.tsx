import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { SentBlastsView } from "@/components/structures/views/sent-blasts-view"

export const metadata = { title: "Sent Blasts — Farmnport Admin" }

export default function SentBlastsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Sent Blasts" text="History of all blast messages sent to farmers and buyers." />
      <SentBlastsView />
    </DashboardShell>
  )
}
