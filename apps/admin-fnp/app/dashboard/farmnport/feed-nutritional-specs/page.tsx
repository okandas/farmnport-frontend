import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { FeedNutritionalSpecsTable } from "@/components/structures/tables/feedNutritionalSpecs"

export default async function FeedNutritionalSpecsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Feed Nutritional Specs"
        text="Manage nutritional specifications for feed products."
      ></DashboardHeader>
      <FeedNutritionalSpecsTable />
    </DashboardShell>
  )
}
