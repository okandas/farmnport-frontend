"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export type AccountOption = {
  label: string
  href: string
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
      {options.map(({ label, href, protected: isProtected }) => (
        <button
          key={href}
          onClick={() => handleClick(href, isProtected)}
          className="flex items-center justify-center rounded-xl border bg-card p-6 text-center hover:bg-muted/50 transition-colors"
        >
          <span className="text-sm font-medium">{label}</span>
        </button>
      ))}
    </div>
  )
}
