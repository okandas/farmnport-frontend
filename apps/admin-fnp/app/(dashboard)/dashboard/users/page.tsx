import { DashboardHeader } from "@/components/state/dashboardHeader";
import { DashboardShell } from "@/components/state/dashboardShell";
import { AdminClientsTable } from "@/components/structures/tables/adminClients";

export default async function DashboardUsersPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Users" text="Manage Users."></DashboardHeader>
      <AdminClientsTable />
    </DashboardShell>
  );
}
