"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"

import { queryUser } from "@/lib/query"
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
    queryKey: ["dashboard-lient", name],
    queryFn: () => queryUser(name),
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

  const Client = data?.data as ApplicationUser

  const stroke = Client?.verified ? "stroke-green-500" : "stroke-red-500"

  return (
    <header className="gap-2 pb-2 border-b">
      <div className="flex max-w-2xl">
        <Avatar className="w-32 h-32 mb-1 mr-4">
          <AvatarImage />
          <AvatarFallback>{makeAbbveriation(Client?.name)}</AvatarFallback>
        </Avatar>
        <p className="mr-2 shrink leading-7 [&:not(:first-child)]:mt-5">
          {Client?.short_description}
        </p>
        <div>
          <Icons.badgeCheck className={`mt-6 h-6 w-6 ${stroke}`} />
        </div>
      </div>
      <h2 className="text-3xl font-semibold tracking-tight transition-colors scroll-m-20 first:mt-4">
        {name}
      </h2>
      <div className="mb-4 leading-7 [&:not(:first-child)]:mt-2">
        <Badge variant="outline">{Client?.type}</Badge>
      </div>
    </header>
  )
}
