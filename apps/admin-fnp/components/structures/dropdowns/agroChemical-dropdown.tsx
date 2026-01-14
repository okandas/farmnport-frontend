"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { MoreHorizontal } from "lucide-react"

import { AgroChemicalItem } from "@/lib/schemas"
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

interface AgroChemicalControlDropDownProps {
  product?: AgroChemicalItem
}

export function AgroChemicalControlDropDown({
  product,
}: AgroChemicalControlDropDownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-8 h-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className={`h-4 w-4 `} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem>
          <Link
            className="w-full"
            href={`/dashboard/agrochemicals/${product?.id}/edit`}
          >
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link className="w-full" href={`#`}>
            Editors Choice
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
