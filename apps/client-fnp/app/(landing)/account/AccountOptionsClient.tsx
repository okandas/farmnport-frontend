"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ShoppingBag, CalendarDays, Inbox, Bell, FileText, User, Shield, Palette, Gavel, LucideIcon } from "lucide-react"

const ICONS: Record<string, LucideIcon> = {
  ShoppingBag, CalendarDays, Inbox, Bell, FileText, User, Shield, Palette, Gavel,
}

export type AccountOption = {
  label: string
  href: string
  icon: string
  protected: boolean
}

export default function AccountOptionsClient({ options }: { options: AccountOption[] }) {
  const { status } = useSession()
  const router = useRouter()

  function handleClick(href: string, isProtected: boolean) {
    if (isProtected && status !== "authenticated") {
      router.push(`/login?next=${href}`)
    } else {
      router.push(href)
    }
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {options.map(({ label, href, icon, protected: isProtected }) => {
        const Icon = ICONS[icon]
        return (
          <button
            key={href}
            onClick={() => handleClick(href, isProtected)}
            className="flex flex-col items-center justify-center gap-3 rounded-xl border bg-card p-6 text-center hover:bg-muted/50 transition-colors"
          >
            {Icon && <Icon className="h-6 w-6 text-muted-foreground" />}
            <span className="text-sm font-medium">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
