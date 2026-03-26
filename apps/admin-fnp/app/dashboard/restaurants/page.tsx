import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { RestaurantsTable } from "@/components/structures/tables/restaurants"

export default async function RestaurantsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Restaurants"
        text="Manage restaurants."
      ></DashboardHeader>
      <RestaurantsTable />
    </DashboardShell>
  )
}
