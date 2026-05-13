import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"

export default async function PreOrdersPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Pre-Orders & Bookings" text="Manage pre-orders and advance bookings." />
      <div className="flex items-center justify-center h-48 border border-dashed rounded-lg text-muted-foreground text-sm">
        Pre-orders & bookings coming soon.
      </div>
    </DashboardShell>
  )
}
