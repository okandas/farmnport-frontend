import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { TumiraGeocodedAddressesTable } from "@/components/structures/tables/tumira-geocoded-addresses"

export default async function TumiraGeocodedAddressesPage() {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Geocoded Addresses"
        text="Addresses resolved to GPS coordinates via Google Maps — cached permanently."
      />
      <TumiraGeocodedAddressesTable />
    </DashboardShell>
  )
}
