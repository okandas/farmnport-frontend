import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { BuyerContactsList } from "@/components/structures/tables/buyerContactsList"

export default async function DashboardBuyerContactsPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Buyer Contacts"
        text="Manage buyer contact information for clients."
      ></DashboardHeader>
      <BuyerContactsList />
    </DashboardShell>
  )
}
