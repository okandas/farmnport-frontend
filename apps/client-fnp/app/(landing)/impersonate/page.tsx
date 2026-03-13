"use client"

import { useEffect, useState } from "react"
import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { Icons } from "@/components/icons/lucide"

export default function ImpersonatePage() {
  const searchParams = useSearchParams()
  const token = searchParams?.get("token")
  const [status, setStatus] = useState<"loading" | "error">("loading")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      return
    }

    signIn("impersonate", {
      token,
      callbackUrl: "/",
    })
  }, [token])

  if (status === "error") {
    return (
      <main className="min-h-[70lvh] flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          <div className="bg-card border rounded-xl p-8 shadow-sm text-center">
            <Icons.warning className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Invalid Impersonation Link</h2>
            <p className="text-muted-foreground">
              This impersonation link is invalid or has expired.
            </p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[70lvh] flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <div className="bg-card border rounded-xl p-8 shadow-sm text-center">
          <Icons.spinner className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold mb-2">Signing In</h2>
          <p className="text-muted-foreground">
            Setting up impersonation session...
          </p>
        </div>
      </div>
    </main>
  )
}
