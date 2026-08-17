"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal, Loader2 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { rejectPreOrderEvent } from "@/lib/query"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PreOrderDropDownProps {
  preorder?: any
}

export function PreOrderDropDown({ preorder }: PreOrderDropDownProps) {
  const [open, setOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const queryClient = useQueryClient()

  const rejectMutation = useMutation({
    mutationFn: () => rejectPreOrderEvent(preorder?.id, rejectReason),
    onSuccess: () => {
      toast({ description: "Booking rejected" })
      setRejectOpen(false)
      setRejectReason("")
      queryClient.invalidateQueries({ queryKey: ["admin-preorders"] })
    },
    onError: (err: any) => toast({ description: err?.response?.data?.message || "Failed to reject", variant: "destructive" }),
  })

  const canReject = preorder?.status === "draft" || preorder?.status === "open"

  return (
    <>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-8 h-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/farmnport/orders/booking-preorders/${preorder?.id}`}>View Bookings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/farmnport/orders/booking-preorders/${preorder?.id}/edit`}>Edit</Link>
          </DropdownMenuItem>
          {canReject && (
            <DropdownMenuItem
              onClick={() => { setOpen(false); setRejectOpen(true) }}
              className="text-red-600 focus:text-red-600"
            >
              Reject
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setRejectOpen(false); setRejectReason("") }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-1">Reject Booking</h2>
            <p className="text-sm text-muted-foreground mb-4">This will notify {preorder?.client_name} via email and SMS.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={3}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setRejectOpen(false); setRejectReason("") }}
                className="text-sm px-4 py-2 rounded-lg border hover:bg-muted/50"
              >
                Cancel
              </button>
              <button
                onClick={() => rejectMutation.mutate()}
                disabled={!rejectReason.trim() || rejectMutation.isPending}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {rejectMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
