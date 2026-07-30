import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { SentBlastsView } from "@/components/structures/views/sent-blasts-view"

export const metadata = { title: "Sent Blasts — Menus Admin" }

export default function MenusSentBlastsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Sent Blasts" text="History of all blast messages sent to menus.co.zw users." />
      <SentBlastsView />
    </DashboardShell>
  )
}
