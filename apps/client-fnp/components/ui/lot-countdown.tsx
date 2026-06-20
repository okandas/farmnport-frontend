"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock } from "lucide-react"

function getCountdown(expiresAt: string) {
  const diff = new Date(expiresAt).getTime() - Date.now()
  if (diff <= 0) return { expired: true, label: "Expired", urgent: false }

  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const urgent = diff < 24 * 60 * 60 * 1000 // under 24h
  const warning = diff < 5 * 24 * 60 * 60 * 1000 // under 5 days

  let label: string
  if (days > 0) {
    label = `Expires in ${days}d ${hours}h`
  } else if (hours > 0) {
    label = `Expires in ${hours}h ${minutes}m`
  } else if (minutes > 0) {
    label = `Expires in ${minutes}m ${seconds}s`
  } else {
    label = `Expires in ${seconds}s`
  }

  return { expired: false, label, urgent, warning }
}

export function LotCountdown({ expiresAt, formattedDate }: { expiresAt: string; formattedDate: string }) {
  const [state, setState] = useState(() => getCountdown(expiresAt))

  useEffect(() => {
    const diff = new Date(expiresAt).getTime() - Date.now()
    // Update every second if under 1 hour, every minute if under 1 day, else every minute
    const interval = diff < 3600000 ? 1000 : 60000
    const timer = setInterval(() => setState(getCountdown(expiresAt)), interval)
    return () => clearInterval(timer)
  }, [expiresAt])

  const color = state.expired ? "text-red-600" : state.urgent ? "text-red-500" : (state as any).warning ? "text-amber-600" : "text-green-600"
  const Icon = state.urgent || state.expired ? Clock : Calendar

  return (
    <div className={`flex items-center gap-1.5 text-sm font-medium ${color}`}>
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span>{state.label}</span>
      <span className="text-muted-foreground font-normal">· {formattedDate}</span>
    </div>
  )
}
