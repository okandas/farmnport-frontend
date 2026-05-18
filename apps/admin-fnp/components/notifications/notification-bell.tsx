"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Bell } from "lucide-react"

import { queryUnreadNotificationCount } from "@/lib/query"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { NotificationDrawer } from "./notification-dropdown"

export function NotificationBell() {
  const [open, setOpen] = useState(false)

  const { data } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => queryUnreadNotificationCount(),
    refetchInterval: 15000,
  })

  const count = data?.data?.count ?? 0

  return (
    <>
      <Button variant="ghost" size="icon" className="relative h-8 w-8" onClick={() => setOpen(true)}>
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex flex-col w-[calc(100%-3rem)] sm:max-w-md p-0">
          <SheetHeader className="px-6 py-4 border-b shrink-0">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </SheetTitle>
          </SheetHeader>
          <NotificationDrawer onClose={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
