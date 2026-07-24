import { bookingsEnabled, notificationsEnabled, documentsEnabled, profileEnabled, securityEnabled } from "@/flags"
import AccountSectionsNav, { NavItem } from "./AccountSectionsNav"

const ALL_NAV: (NavItem & { flag?: () => Promise<boolean> })[] = [
  { label: "My Orders",      href: "/account/orders",              tooltip: "Items you bought from the farmnport shop." },
  { label: "My Offers",      href: "/account/bids",                tooltip: "Offers you placed on lots posted by other users." },
  { label: "My Lots",        href: "/account/lots",                tooltip: "Lots you posted for sale or to request produce." },
  { label: "Booked",         href: "/account/bookings",            tooltip: "Bookings you made as a customer from other sellers.", flag: bookingsEnabled },
  { label: "Received",       href: "/account/incoming-bookings",   tooltip: "Bookings others made from you — review and confirm.", flag: bookingsEnabled },
  { label: "My Bookings",    href: "/account/booking-preorders",   tooltip: "Booking events you created for others to book from you.", flag: bookingsEnabled },
  { label: "Notifications",  href: "/account/notifications",       flag: notificationsEnabled },
  { label: "Documents",      href: "/account/documents",           tooltip: "Documents you purchased.", flag: documentsEnabled },
  { label: "Profile",        href: "/account/profile",             flag: profileEnabled },
  { label: "Security",       href: "/account/security",            flag: securityEnabled },
  { label: "Theme",          href: "/account/theme" },
]

export default async function AccountSectionsLayout({ children }: { children: React.ReactNode }) {
  const flagResults = await Promise.all(
    ALL_NAV.map(({ flag }) => (flag ? flag() : Promise.resolve(true)))
  )

  const items: NavItem[] = ALL_NAV
    .filter((_, i) => flagResults[i])
    .map(({ label, href, tooltip }) => ({ label, href, tooltip }))

  return <AccountSectionsNav items={items}>{children}</AccountSectionsNav>
}
