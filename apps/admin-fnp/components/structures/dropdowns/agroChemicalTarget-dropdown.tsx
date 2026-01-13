"use client"

import Link from "next/link"
import { MoreHorizontal } from "lucide-react"

import { AgroChemicalTarget } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AgroChemicalTargetControlDropDownProps {
  target?: AgroChemicalTarget
}

export function AgroChemicalTargetControlDropDown({
  target,
}: AgroChemicalTargetControlDropDownProps) {
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
            href={`/dashboard/agrochemical-targets/${target?.id}/edit`}
          >
            Edit
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
