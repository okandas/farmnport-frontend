"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoreHorizontal } from "lucide-react"

import { ProducerPriceList } from "@/lib/schemas"
import { slug } from "@/lib/utilities"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"

interface PriceControlDropDownProps {
  priceItem?: ProducerPriceList
}

export function PriceControlDropDown({ priceItem }: PriceControlDropDownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-8 h-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className={`w-4 h-4 `} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem>
          <Link
            className="w-full"
            href={`/dashboard/prices/${priceItem?.client_id}/edit`}
          >
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
