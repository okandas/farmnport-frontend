import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { CropGroupsTable } from "@/components/structures/tables/cropGroups"

export default async function CropGroupsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Crop Groups"
        text="Manage crop groups (e.g., Cucurbits, Brassicas, Stone Fruits) for batch dosage rate entry."
      ></DashboardHeader>
      <CropGroupsTable />
    </DashboardShell>
  )
}
