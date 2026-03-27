"use client"

import Link from "next/link"
import { MoreHorizontal } from "lucide-react"

import { MenuItemComponent } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MenuItemComponentDropDownProps {
  component?: MenuItemComponent
}

export function MenuItemComponentDropDown({
  component,
}: MenuItemComponentDropDownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-8 h-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem>
          <Link
            className="w-full"
            href={`/dashboard/restaurants/menu-item-components/${component?.id}/edit`}
          >
            Edit
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
