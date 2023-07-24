import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { Placeholder } from "@/components/state/placeholder"

export default async function DashboardUsersPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Users" text="Manage Users."></DashboardHeader>
      <Placeholder>
        <Placeholder.Icon name="user" />
        <Placeholder.Title>Work In Progress</Placeholder.Title>
        <Placeholder.Description>
          We are now adding a users table here.
        </Placeholder.Description>
      </Placeholder>
    </DashboardShell>
  )
}
