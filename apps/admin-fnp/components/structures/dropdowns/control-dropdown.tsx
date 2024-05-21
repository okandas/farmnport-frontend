"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { MoreHorizontal } from "lucide-react"

import { verifyClient, badClient } from "@/lib/query"
import { ApplicationUserID, ApplicationUser } from "@/lib/schemas"
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

interface ControlDropDownProps {
  client?: ApplicationUser
}

export function ControlDropDown({ client }: ControlDropDownProps) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { mutate, isPending } = useMutation({
    mutationFn: verifyClient,
    onSuccess: (data) => {
      const verified = data?.data?.verified
        ? "Verified Successfully"
        : "Unverified Successfully"
      toast({
        description: verified,
      })

      queryClient.invalidateQueries({ queryKey: ["dashboard-clients"] })

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
              title: "Uh oh!  client update failed.",
              description: "There was a problem with your request.",
              action: <ToastAction altText="Try again">Try again</ToastAction>,
            })
            break
        }
      }
    },
  })


  const { mutate: mutateBadClient, isPending: isPendingBadClient } = useMutation({
    mutationFn: badClient,
    onSuccess: (data) => {
      const participant = data?.data?.bad_participant
        ? "Bad Client Tagged Successfully"
        : "Bad Clien Untagged Successfully"
      toast({
        description: participant,
      })

      queryClient.invalidateQueries({ queryKey: ["dashboard-clients"] })

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
              title: "Uh oh!  client update failed.",
              description: "There was a problem with your request.",
              action: <ToastAction altText="Try again">Try again</ToastAction>,
            })
            break
        }
      }
    },
  })

  async function verify(payload: ApplicationUserID) {
    mutate(payload)
  }

  async function bad(payload: ApplicationUserID) {
    mutateBadClient(payload)
  }

  const animate = isPending || isPendingBadClient ? "animate-bounce" : ""

  const stroke = client?.verified ? "stroke-green-500" : "stroke-red-500"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-8 h-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className={`h-4 w-4 ${stroke} ${animate}`} />
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
              const payload: ApplicationUserID = {
                id: client.id,
              }
              verify(payload)
            }
          }}
        >
          {client?.verified === true ? "Unverify Client" : "Verify Client"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            if (client?.id !== undefined) {
              const payload: ApplicationUserID = {
                id: client.id,
              }
              bad(payload)
            }
          }}
        >
          {client?.bad_participant === false ? "Mark As Bad Client" : "Mark As Good Client"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
