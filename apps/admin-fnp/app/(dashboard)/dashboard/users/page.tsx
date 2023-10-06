import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { ClientsTable } from "@/components/structures/tables/clients"

export default async function DashboardUsersPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Users" text="Manage Users."></DashboardHeader>
      <ClientsTable />
    </DashboardShell>
  )
}
