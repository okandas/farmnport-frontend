"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { MoreHorizontal } from "lucide-react"

import { deleteCdmPrice } from "@/lib/query"
import { CdmPrice } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"

interface CdmPriceControlDropDownProps {
  price?: CdmPrice
}

export function CdmPriceControlDropDown({ price }: CdmPriceControlDropDownProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const { mutate: deletePrice, isPending } = useMutation({
    mutationFn: deleteCdmPrice,
    onSuccess: () => {
      toast({
        description: "CDM price deleted successfully",
      })
      queryClient.invalidateQueries({ queryKey: ["dashboard-cdm-prices"] })
      router.refresh()
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete CDM price",
        variant: "destructive",
      })
    },
  })

  const handleDelete = () => {
    if (price?.id && confirm("Are you sure you want to delete this CDM price?")) {
      deletePrice(price.id)
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem>
          <Link
            className="w-full"
            href={`/dashboard/farmnport/cdm-prices/${price?.id}/edit`}
          >
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={handleDelete}
          disabled={isPending}
        >
          {isPending ? "Deleting..." : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
