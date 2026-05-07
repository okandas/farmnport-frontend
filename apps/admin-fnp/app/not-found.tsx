"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function NotFound() {
  const pathname = usePathname()

  const dashboardHref = pathname?.startsWith("/dashboard/restaurants")
    ? "/dashboard/restaurants"
    : "/dashboard/farmnport"

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <h2 className="text-2xl font-semibold">Page Not Found</h2>
      <p className="text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href={dashboardHref}
        className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Go to Dashboard
      </Link>
    </div>
  )
}
