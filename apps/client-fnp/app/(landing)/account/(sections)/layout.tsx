import { bookingsEnabled, notificationsEnabled, documentsEnabled, profileEnabled, securityEnabled } from "@/flags"
import AccountSectionsNav, { NavItem } from "./AccountSectionsNav"

const ALL_NAV: (NavItem & { flag?: () => Promise<boolean> })[] = [
  { label: "Orders",            href: "/account/orders" },
  { label: "Bids",              href: "/account/bids" },
  { label: "Lots",              href: "/account/lots" },
  { label: "My Booking Orders",  href: "/account/bookings",          flag: bookingsEnabled },
  { label: "Incoming Orders",   href: "/account/incoming-bookings", flag: bookingsEnabled },
  { label: "My Pre-Orders",     href: "/account/booking-events",   flag: bookingsEnabled, tooltip: "Create and manage pre-order batches for your products. Buyers request bookings, you confirm availability, then they pay." },
  { label: "Notifications",     href: "/account/notifications",     flag: notificationsEnabled },
  { label: "Documents",         href: "/account/documents",         flag: documentsEnabled },
  { label: "Profile",           href: "/account/profile",           flag: profileEnabled },
  { label: "Security",          href: "/account/security",          flag: securityEnabled },
  { label: "Theme",             href: "/account/theme" },
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
