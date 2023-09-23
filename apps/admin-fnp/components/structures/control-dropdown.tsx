"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { MoreHorizontal } from "lucide-react"

import { verifyClientAsAdmin } from "@/lib/query"
import { AdminApplicationUserID, ApplicationUser } from "@/lib/schemas"
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

interface AdminControlDropDownProps {
  client?: ApplicationUser
}

export function AdminControlDropDown({ client }: AdminControlDropDownProps) {
  const router = useRouter()
  const { mutate, isLoading } = useMutation(verifyClientAsAdmin, {
    onSuccess: (data) => {
      const verified = data?.data?.verified
        ? "Verified Successfully"
        : "Unverified Successfully"
      toast({
        description: verified,
      })

      router.refresh()
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        switch (error.code) {
          case "ERR_NETWORK":
            toast({
              description: "There seems to be a network error.",
              action: <ToastAction altText="Try again">Try again</ToastAction>,
            })
            break

          default:
            toast({
              title: "Uh oh! Admin client update failed.",
              description: "There was a problem with your request.",
              action: <ToastAction altText="Try again">Try again</ToastAction>,
            })
            break
        }
      }
    },
  })

  async function onSubmit(payload: AdminApplicationUserID) {
    mutate(payload)
  }

  const animate = isLoading ? "animate-bounce" : ""

  const stroke = client?.verified ? "stroke-green-500" : "stroke-red-500"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-8 h-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className={`w-4 h-4 ${stroke} ${animate}`} />
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
        <DropdownMenuItem
          onClick={() => {
            if (client?.id !== undefined) {
              const payload: AdminApplicationUserID = {
                id: client.id,
              }
              onSubmit(payload)
            }
          }}
        >
          {client?.verified === true ? "Unverify Client" : "Verify Client"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
