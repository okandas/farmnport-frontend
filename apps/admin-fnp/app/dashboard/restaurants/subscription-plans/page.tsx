import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { SubscriptionPlansTable } from "@/components/structures/tables/subscription-plans"

export default async function SubscriptionPlansPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Subscription Plans"
        text="Manage restaurant subscription plans."
      />
      <SubscriptionPlansTable />
    </DashboardShell>
  )
}
