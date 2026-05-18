"use client"

import { useRef, useCallback } from "react"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"

import { queryNotificationsList, markNotificationsRead } from "@/lib/query"
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

interface NotificationDrawerProps {
  onClose: () => void
}

const PAGE_SIZE = 20

export function NotificationDrawer({ onClose }: NotificationDrawerProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const observerRef = useRef<IntersectionObserver | null>(null)

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ["notifications", "list"],
    queryFn: ({ pageParam = 1 }) => queryNotificationsList(pageParam as number).then((r) => r.data),
    getNextPageParam: (lastPage: any, allPages) => {
      const total = lastPage?.total ?? 0
      const fetched = allPages.length * PAGE_SIZE
      return fetched < total ? allPages.length + 1 : undefined
    },
    initialPageParam: 1,
  })

  const markReadMutation = useMutation({
    mutationFn: (data: { ids?: string[]; all?: boolean }) => markNotificationsRead(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    },
  })

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) observerRef.current.disconnect()
    if (!node) return
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    })
    observerRef.current.observe(node)
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const allNotifications: Notification[] = data?.pages.flatMap((p: any) => p?.notifications ?? []) ?? []
  const hasUnread = allNotifications.some((n) => !n.read)

  const handleClick = (notification: Notification) => {
    if (!notification.read) {
      markReadMutation.mutate({ ids: [notification.id] })
    }
    onClose()
    router.push(notification.link_to)
  }

  return (
    <>
      {/* Mark all read bar */}
      {hasUnread && (
        <div className="px-6 py-2 border-b shrink-0 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => markReadMutation.mutate({ all: true })}
            disabled={markReadMutation.isPending}
          >
            Mark all read
          </Button>
        </div>
      )}

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))}
          </div>
        ) : allNotifications.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          <div className="divide-y">
            {allNotifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleClick(notification)}
                className={`flex w-full flex-col gap-0.5 px-6 py-4 text-left transition-colors hover:bg-muted/50 ${
                  !notification.read ? "bg-muted/30" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium leading-tight">{notification.title}</span>
                  {!notification.read && (
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground line-clamp-2">{notification.message}</span>
                <span className="text-[11px] text-muted-foreground/60">
                  {formatDistanceToNow(new Date(notification.created), { addSuffix: true })}
                </span>
              </button>
            ))}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="py-3 text-center">
              {isFetchingNextPage && (
                <div className="space-y-3 px-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
