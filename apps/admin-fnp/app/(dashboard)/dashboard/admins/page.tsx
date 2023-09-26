import { DashboardHeader } from "@/components/state/dashboardHeader";
import { DashboardShell } from "@/components/state/dashboardShell";
import { Placeholder } from "@/components/state/placeholder";

export default async function DashboardUsersPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Administrators"
        text="Manage Admins."
      ></DashboardHeader>
      <Placeholder>
        <Placeholder.Icon name="construction" />
        <Placeholder.Title>Work In Progress</Placeholder.Title>
        <Placeholder.Description>
          We are now adding administrators table here.
        </Placeholder.Description>
      </Placeholder>
    </DashboardShell>
  );
}
