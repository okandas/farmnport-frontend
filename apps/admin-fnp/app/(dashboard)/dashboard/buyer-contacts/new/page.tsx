import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { BuyerContactForm } from "@/components/structures/forms/buyer-contact-form"

export default async function NewBuyerContactPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Add Buyer Contact"
        text="Manually add a new buyer contact for priority tracking."
      />
      <BuyerContactForm />
    </DashboardShell>
  )
}
