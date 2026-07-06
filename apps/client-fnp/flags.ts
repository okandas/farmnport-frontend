import { growthbookAdapter } from "@flags-sdk/growthbook"
import { flag } from "flags/next"
import { identify } from "@/lib/identify"

// SMS alerts — dev: flip ON to send real SMS; production: flip OFF to pause
export const smsAlertsEnabled = flag<boolean>({
  key: "sms_alerts_enabled",
  adapter: growthbookAdapter.feature<boolean>(),
  defaultValue: false,
  identify,
})

// Email alerts — dev: flip ON to send real emails; production: flip OFF to pause
export const emailAlertsEnabled = flag<boolean>({
  key: "email_alerts_enabled",
  adapter: growthbookAdapter.feature<boolean>(),
  defaultValue: false,
  identify,
})

// Account section gates
export const notificationsEnabled = flag<boolean>({
  key: "notifications_enabled",
  adapter: growthbookAdapter.feature<boolean>(),
  defaultValue: false,
  identify,
})

export const documentsEnabled = flag<boolean>({
  key: "documents_enabled",
  adapter: growthbookAdapter.feature<boolean>(),
  defaultValue: false,
  identify,
})

export const bookingsEnabled = flag<boolean>({
  key: "bookings_enabled",
  adapter: growthbookAdapter.feature<boolean>(),
  defaultValue: false,
  identify,
})

export const preorderDepositEnabled = flag<boolean>({
  key: "preorder_deposit_enabled",
  adapter: growthbookAdapter.feature<boolean>(),
  defaultValue: false,
  identify,
})

export const profileEnabled = flag<boolean>({
  key: "profile_enabled",
  adapter: growthbookAdapter.feature<boolean>(),
  defaultValue: false,
  identify,
})

export const securityEnabled = flag<boolean>({
  key: "security_enabled",
  adapter: growthbookAdapter.feature<boolean>(),
  defaultValue: false,
  identify,
})
