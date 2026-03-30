"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

import { queryRecentNotifications, markNotificationsRead } from "@/lib/query"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link_to: string
  read: boolean
  created: string
}

interface NotificationDropdownProps {
  onClose: () => void
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: () => queryRecentNotifications(),
  })

  const markReadMutation = useMutation({
    mutationFn: (data: { ids?: string[]; all?: boolean }) => markNotificationsRead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  const notifications: Notification[] = data?.data?.notifications ?? []

  const handleClick = (notification: Notification) => {
    if (!notification.read) {
      markReadMutation.mutate({ ids: [notification.id] })
    }
    onClose()
    router.push(notification.link_to)
  }

  const handleMarkAllRead = () => {
    markReadMutation.mutate({ all: true })
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h4 className="text-sm font-semibold">Notifications</h4>
        {notifications.some((n) => !n.read) && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            onClick={handleMarkAllRead}
          >
            Mark all read
          </Button>
        )}
      </div>

      <ScrollArea className="max-h-[300px]">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleClick(notification)}
                className={`flex w-full flex-col gap-0.5 border-b px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                  !notification.read ? "bg-muted/30" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium leading-tight">
                    {notification.title}
                  </span>
                  {!notification.read && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {notification.message}
                </span>
                <span className="text-[11px] text-muted-foreground/60">
                  {formatDistanceToNow(new Date(notification.created), { addSuffix: true })}
                </span>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
