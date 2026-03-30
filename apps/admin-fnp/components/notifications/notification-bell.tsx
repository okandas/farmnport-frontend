"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Bell } from "lucide-react"

import { queryUnreadNotificationCount } from "@/lib/query"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { NotificationDropdown } from "./notification-dropdown"

export function NotificationBell() {
  const [open, setOpen] = useState(false)

  const { data } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => queryUnreadNotificationCount(),
    refetchInterval: 15000,
  })

  const count = data?.data?.count ?? 0

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <NotificationDropdown onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}
