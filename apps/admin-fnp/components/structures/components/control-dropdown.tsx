import Link from "next/link"
import { MoreHorizontal } from "lucide-react"

import { ApplicationUser } from "@/lib/schemas"
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

interface AdminControlDropDownProps {
  client?: ApplicationUser
}

export function AdminControlDropDown({ client }: AdminControlDropDownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-8 h-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem>
          <Link
            className="w-full"
            href={`/dashboard/users/${slug(client?.name)}/edit`}
          >
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <Link
            className="w-full"
            href={`/dashboard/users/${slug(client?.name)}`}
          >
            View Client Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>Verify Client</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
