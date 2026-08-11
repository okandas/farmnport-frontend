import { Lock } from "lucide-react"

export function PaynowBadge() {
  return (
    <div className="flex items-center gap-1.5">
      <Lock className="w-3 h-3 shrink-0" />
      <span>Secure checkout via</span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logos/paynow-dark.svg" alt="Paynow" className="h-12 w-auto dark:hidden" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logos/paynow-light.svg" alt="Paynow" className="h-12 w-auto hidden dark:block" />
    </div>
  )
}
