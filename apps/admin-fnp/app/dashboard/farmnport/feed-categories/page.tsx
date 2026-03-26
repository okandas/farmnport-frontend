import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { FeedCategoriesTable } from "@/components/structures/tables/feedCategories"

export default async function FeedCategoriesPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Feed Categories"
        text="Manage feed product categories (Finished Feed, Concentrate, etc.)."
      ></DashboardHeader>
      <FeedCategoriesTable />
    </DashboardShell>
  )
}
