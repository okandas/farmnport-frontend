"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

export function useNotificationStream(enabled: boolean) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!enabled || !BASE_URL) return

    const eventSource = new EventSource(
      `${BASE_URL}/v1/user/notifications/stream`,
      { withCredentials: true }
    )

    eventSource.addEventListener("unread-count", (e) => {
      const { count } = JSON.parse(e.data)
      queryClient.setQueryData(["notifications", "unread-count"], { data: { count } })
    })

    eventSource.addEventListener("new-notification", () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "recent"] })
    })

    eventSource.onerror = () => {
      // EventSource auto-reconnects after ~3 seconds
    }

    return () => eventSource.close()
  }, [enabled, queryClient])
}
