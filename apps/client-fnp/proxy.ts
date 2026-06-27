import { NextResponse } from "next/server"
import { auth as middleware } from "@/auth"

// ── GrowthBook feature flag cache ─────────────────────────────────────────────
let featuresCache: Record<string, any> | null = null
let cacheTime = 0
const CACHE_TTL = 60_000 // 1 minute

async function isFeatureOn(key: string): Promise<boolean> {
  const now = Date.now()
  if (!featuresCache || now - cacheTime > CACHE_TTL) {
    const apiHost = process.env.GROWTHBOOK_API_HOST
    const clientKey = process.env.GROWTHBOOK_CLIENT_KEY
    if (!apiHost || !clientKey) return false
    try {
      const res = await fetch(`${apiHost}/api/features/${clientKey}`)
      const json = await res.json()
      featuresCache = json.features ?? {}
      cacheTime = now
    } catch {
      return false
    }
  }
  return featuresCache?.[key]?.defaultValue === true
}

// ── Route → flag map ──────────────────────────────────────────────────────────
const FLAG_GATES: { pattern: RegExp; flag: string }[] = [
  { pattern: /^\/account\/bookings(\/|$)/, flag: "bookings_enabled" },
  { pattern: /^\/account\/incoming-bookings(\/|$)/, flag: "bookings_enabled" },
  { pattern: /^\/account\/profile(\/|$)/, flag: "profile_enabled" },
  { pattern: /^\/account\/security(\/|$)/, flag: "security_enabled" },
  { pattern: /^\/account\/notifications(\/|$)/, flag: "notifications_enabled" },
  { pattern: /^\/account\/documents(\/|$)/, flag: "documents_enabled" },
]

// ── Middleware ─────────────────────────────────────────────────────────────────
export default middleware(async (request) => {
  const pathname = request.nextUrl.pathname

  // Redirect logged-in users away from login/signup
  if ((pathname === "/login" || pathname === "/signup") && request.auth?.user !== undefined) {
    const url = request.nextUrl.clone()
    url.pathname = "/buyers"
    return NextResponse.redirect(url)
  }

  // Redirect unauthenticated users to login for protected paths
  const paths = ["profile", "bookings", "incoming-bookings", "security"]
  for (const path of paths) {
    if (pathname.includes(path) && request.auth?.user === undefined) {
      const url = request.nextUrl.clone()
      url.pathname = "/login"
      return NextResponse.redirect(url)
    }
  }

  // Feature flag gates — redirect to /account if flag is off
  for (const { pattern, flag } of FLAG_GATES) {
    if (pattern.test(pathname)) {
      const enabled = await isFeatureOn(flag)
      if (!enabled) {
        const url = request.nextUrl.clone()
        url.pathname = "/account"
        return NextResponse.redirect(url)
      }
      break
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
