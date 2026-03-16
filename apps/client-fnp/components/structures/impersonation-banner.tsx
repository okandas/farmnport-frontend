"use client"

import { signOut } from "next-auth/react"
import { Icons } from "@/components/icons/lucide"
import { Button } from "@/components/ui/button"
import { AuthenticatedUser } from "@/lib/schemas"

interface ImpersonationBannerProps {
  user: AuthenticatedUser
}

export function ImpersonationBanner({ user }: ImpersonationBannerProps) {
  if (!user?.impersonated_by) return null

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-2 z-[60] relative">
      <Icons.shield className="h-4 w-4" />
      <span>Viewing as <strong>{user.username}</strong> (Admin Impersonation)</span>
      <Button
        variant="outline"
        size="sm"
        className="ml-2 h-6 px-2 text-xs bg-amber-600 border-amber-700 text-amber-50 hover:bg-amber-700 hover:text-white"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Stop Impersonating
      </Button>
    </div>
  )
}
