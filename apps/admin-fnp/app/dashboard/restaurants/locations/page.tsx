import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { RestaurantLocationsTable } from "@/components/structures/tables/restaurant-locations"

export default async function RestaurantLocationsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Locations"
        text="Manage restaurant locations and branches."
      ></DashboardHeader>
      <RestaurantLocationsTable />
    </DashboardShell>
  )
}
