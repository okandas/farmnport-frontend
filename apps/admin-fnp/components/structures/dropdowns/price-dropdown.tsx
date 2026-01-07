"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { MoreHorizontal } from "lucide-react"

import { deleteProducerPriceList } from "@/lib/query"
import { ProducerPriceList } from "@/lib/schemas"
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

interface PriceControlDropDownProps {
  priceItem?: ProducerPriceList
}

export function PriceControlDropDown({ priceItem }: PriceControlDropDownProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

  const { mutate: deletePriceList, isPending } = useMutation({
    mutationFn: deleteProducerPriceList,
    onSuccess: () => {
      toast({
        description: "Price list deleted successfully",
      })
      // Invalidate and refetch the price lists query
      queryClient.invalidateQueries({ queryKey: ["dashboard-producer-price-lists"] })
      router.refresh()
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete price list",
        variant: "destructive",
      })
    },
  })

  const handleDelete = () => {
    if (priceItem?.id && confirm("Are you sure you want to delete this price list?")) {
      deletePriceList(priceItem.id)
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className={`h-4 w-4 `} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem>
          <Link
            className="w-full"
            href={`/dashboard/prices/${priceItem?.id}/edit`}
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
