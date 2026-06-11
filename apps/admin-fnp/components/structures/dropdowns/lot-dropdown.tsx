"use client"

import { useState } from "react"
import { MoreHorizontal } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/use-toast"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { approveLot } from "@/lib/query"

interface LotDropDownProps {
  lot?: any
}

export function LotDropDown({ lot }: LotDropDownProps) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const { mutate: approve, isPending } = useMutation({
    mutationFn: () => approveLot(lot?.slug),
    onSuccess: () => {
      toast({ title: "Lot approved and now live" })
      queryClient.invalidateQueries({ queryKey: ["admin-lots"] })
    },
    onError: () => {
      toast({ title: "Failed to approve lot", variant: "destructive" })
    },
  })

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-8 h-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        {!lot?.moderated && (
          <DropdownMenuItem
            disabled={isPending}
            onClick={() => {
              setOpen(false)
              approve()
            }}
          >
            {isPending ? "Approving…" : "Approve"}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
