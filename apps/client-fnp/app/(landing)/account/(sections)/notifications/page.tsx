"use client"

import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, Bell } from "lucide-react"
import Link from "next/link"

import { listBookingNotifications, markBookingNotificationsRead } from "@/lib/query"

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export default function NotificationsPage() {
  const { data: session } = useSession()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["booking-notifications"],
    queryFn: () => listBookingNotifications().then((r) => r.data),
    enabled: !!session,
  })

  const markRead = useMutation({
    mutationFn: (ids: string[]) => markBookingNotificationsRead(ids),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["booking-notifications"] })
      qc.invalidateQueries({ queryKey: ["booking-notifications-count"] })
    },
  })

  const notifications: any[] = (data as any)?.notifications ?? []
  const unread = notifications.filter((n) => !n.read)

  function handleMarkAllRead() {
    const ids = unread.map((n: any) => n.id)
    if (ids.length > 0) markRead.mutate(ids)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/account" className="hover:text-foreground transition-colors">Account</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Notifications</span>
      </nav>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Notifications</h1>
        {unread.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markRead.isPending}
            className="text-xs text-primary hover:underline disabled:opacity-50"
          >
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Bell className="w-10 h-10 mx-auto text-muted-foreground/40" />
          <p className="font-semibold">No notifications yet</p>
          <p className="text-sm text-muted-foreground">You'll be notified when your booking status changes.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => (
            <Link
              key={n.id}
              href={n.link_to ?? "/account/bookings"}
              onClick={() => { if (!n.read) markRead.mutate([n.id]) }}
              className={`block border rounded-xl p-4 transition-colors hover:bg-muted/30 ${!n.read ? "border-orange-300 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <p className="text-sm font-semibold">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <p className="text-xs text-muted-foreground">{formatDate(n.created)}</p>
                  {!n.read && (
                    <span className="inline-block w-2 h-2 rounded-full bg-orange-500 ml-auto" />
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
