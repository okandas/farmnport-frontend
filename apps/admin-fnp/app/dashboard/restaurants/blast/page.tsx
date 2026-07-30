import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { BlastView } from "@/components/structures/views/blast-view"

export const metadata = { title: "Blast — Menus Admin" }

export default function MenusBlastPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Blast" text="Send targeted SMS, WhatsApp, or email messages to menus.co.zw users." />
      <BlastView source="menus" />
    </DashboardShell>
  )
}
