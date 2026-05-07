"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal, QrCode } from "lucide-react"

import { RestaurantLocation } from "@/lib/schemas"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LocationQRModal } from "@/components/structures/modals/location-qr-modal"

interface RestaurantLocationDropDownProps {
  location?: RestaurantLocation
}

export function RestaurantLocationDropDown({
  location,
}: RestaurantLocationDropDownProps) {
  const [qrOpen, setQrOpen] = useState(false)

  return (
    <>
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
              href={`/dashboard/restaurants/locations/${location?.id}/edit`}
            >
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 cursor-pointer"
            onSelect={() => setQrOpen(true)}
          >
            <QrCode className="h-4 w-4" />
            Generate QR
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {location && (
        <LocationQRModal
          location={location}
          open={qrOpen}
          onOpenChange={setQrOpen}
        />
      )}
    </>
  )
}
