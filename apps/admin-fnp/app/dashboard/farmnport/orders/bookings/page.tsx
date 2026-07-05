import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { BookingsTable } from "@/components/structures/tables/bookings"

export default function AdminBookingsPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Bookings" text="All booking orders — pre-orders, deliveries, pickups." />
      <BookingsTable />
    </DashboardShell>
  )
}
