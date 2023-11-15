import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { ClientsTable } from "@/components/structures/tables/clients"

export default async function DashboardUsersPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Clients" text="Manage Clients."></DashboardHeader>
      <ClientsTable />
    </DashboardShell>
  )
}
