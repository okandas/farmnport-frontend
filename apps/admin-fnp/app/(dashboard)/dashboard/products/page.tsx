import { Skeleton } from "@/components/ui/skeleton"

import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { ProductsTable } from "@/components/structures/tables/products"

export default async function ProductsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Products Lists"
        text="Manage Products."
      ></DashboardHeader>
      <ProductsTable />
    </DashboardShell>
  )
}
