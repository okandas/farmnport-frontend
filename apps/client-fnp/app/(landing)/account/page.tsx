import { bookingsEnabled, profileEnabled, securityEnabled, notificationsEnabled, documentsEnabled } from "@/flags"
import AccountOptionsClient, { AccountOption } from "./AccountOptionsClient"

const ALL_OPTIONS: (AccountOption & { flag?: () => Promise<boolean> })[] = [
  { label: "Orders",            href: "/account/orders",            icon: "ShoppingBag", protected: true },
  { label: "Bids",              href: "/account/bids",              icon: "Gavel",       protected: true },
  { label: "Bookings",          href: "/account/bookings",          icon: "CalendarDays",protected: true, flag: bookingsEnabled },
  { label: "Incoming Bookings", href: "/account/incoming-bookings", icon: "Inbox",       protected: true, flag: bookingsEnabled },
  { label: "Notifications",     href: "/account/notifications",     icon: "Bell",        protected: true, flag: notificationsEnabled },
  { label: "Documents",         href: "/account/documents",         icon: "FileText",    protected: true, flag: documentsEnabled },
  { label: "Profile",           href: "/account/profile",           icon: "User",        protected: true, flag: profileEnabled },
  { label: "Security",          href: "/account/security",          icon: "Shield",      protected: true, flag: securityEnabled },
  { label: "Theme",             href: "/account/theme",             icon: "Palette",     protected: false },
]

export default async function AccountPage() {
  const flagResults = await Promise.all(
    ALL_OPTIONS.map(({ flag }) => (flag ? flag() : Promise.resolve(true)))
  )

  const options: AccountOption[] = ALL_OPTIONS
    .filter((_, i) => flagResults[i])
    .map(({ label, href, icon, protected: p }) => ({ label, href, icon, protected: p }))

  return <AccountOptionsClient options={options} />
}
