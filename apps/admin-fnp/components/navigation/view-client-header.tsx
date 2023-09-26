"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"

import { queryUserAsAdmin } from "@/lib/query"
import { ApplicationUser } from "@/lib/schemas"
import { makeAbbveriation } from "@/lib/utilities"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons/lucide"

interface ViewClientHeaderProps {
  params: {
    slug: string
  }
}

export default function ViewClientHeader({ params }: ViewClientHeaderProps) {
  const name = params.slug

  const { isError, isLoading, isFetching, data, refetch } = useQuery({
    queryKey: ["dashboard-admin-client", name],
    queryFn: () => queryUserAsAdmin(name),
  })

  if (isError) {
    if (isAxiosError(data)) {
      switch (data.code) {
        case "ERR_NETWORK":
          toast({
            description: "There seems to be a network error.",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          })
          break

        default:
          toast({
            title: "Uh oh! Failed to fetch clients.",
            description: "There was a problem with your request.",
            action: (
              <ToastAction altText="Try again" onClick={() => refetch()}>
                Try again
              </ToastAction>
            ),
          })
          break
      }
    }
    return null
  }

  if (isLoading || isFetching) {
    return null
  }

  const adminClient = data?.data as ApplicationUser

  const stroke = adminClient?.verified ? "stroke-green-500" : "stroke-red-500"

  return (
    <header className="gap-2 border-b pb-2">
      <div className="flex max-w-2xl">
        <Avatar className="mb-1 mr-4 h-32 w-32">
          <AvatarImage />
          <AvatarFallback>{makeAbbveriation(adminClient?.name)}</AvatarFallback>
        </Avatar>
        <p className="mr-2 shrink leading-7 [&:not(:first-child)]:mt-5">
          {adminClient?.short_description}
        </p>
        <div>
          <Icons.badgeCheck className={`mt-6 h-6 w-6 ${stroke}`} />
        </div>
      </div>
      <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-4">
        {name}
      </h2>
      <div className="mb-4 leading-7 [&:not(:first-child)]:mt-2">
        <Badge variant="outline">{adminClient?.type}</Badge>
      </div>
    </header>
  )
}
