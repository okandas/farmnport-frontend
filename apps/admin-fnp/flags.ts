import { growthbookAdapter } from "@flags-sdk/growthbook"
import { flag } from "flags/next"
import { identify } from "@/lib/identify"

// Enables real SMS + WhatsApp sends in dev (off = logrus only)
export const sendDevAlertsEnabled = flag<boolean>({
  key: "send_dev_alerts_enabled",
  adapter: growthbookAdapter.feature<boolean>(),
  defaultValue: false,
  identify,
})

// Controls whether SMS/WhatsApp alerts fire in production (off = no sends)
export const sendSmsAlertsEnabled = flag<boolean>({
  key: "send_sms_alerts_enabled",
  adapter: growthbookAdapter.feature<boolean>(),
  defaultValue: true,
  identify,
})
