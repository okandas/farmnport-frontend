import { bookingsEnabled, profileEnabled, securityEnabled, notificationsEnabled, documentsEnabled } from "@/flags"
import AccountOptionsClient, { AccountOption } from "./AccountOptionsClient"

const ALL_OPTIONS: (AccountOption & { flag?: () => Promise<boolean> })[] = [
  { label: "Orders",              href: "/account/orders",            protected: true },
  { label: "My Bids for Lots",    href: "/account/bids",              protected: true },
  { label: "Lots",                href: "/account/lots",              protected: true },
  { label: "My Bids for Bookings", href: "/account/bookings",         protected: true, flag: bookingsEnabled },
  { label: "Received Bids",       href: "/account/incoming-bookings", protected: true, flag: bookingsEnabled },
  { label: "My Bookings",         href: "/account/booking-preorders", protected: true, flag: bookingsEnabled },
  { label: "Notifications",       href: "/account/notifications",     protected: true, flag: notificationsEnabled },
  { label: "Documents",           href: "/account/documents",         protected: true, flag: documentsEnabled },
  { label: "Profile",             href: "/account/profile",           protected: true, flag: profileEnabled },
  { label: "Security",            href: "/account/security",          protected: true, flag: securityEnabled },
  { label: "Theme",               href: "/account/theme",             protected: false },
]

export default async function AccountPage() {
  const flagResults = await Promise.all(
    ALL_OPTIONS.map(({ flag }) => (flag ? flag() : Promise.resolve(true)))
  )

  const options: AccountOption[] = ALL_OPTIONS
    .filter((_, i) => flagResults[i])
    .map(({ label, href, protected: p }) => ({ label, href, protected: p }))

  return <AccountOptionsClient options={options} />
}
